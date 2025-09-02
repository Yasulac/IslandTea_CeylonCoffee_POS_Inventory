import { db } from '../../firebaseConfig';
import { 
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot, serverTimestamp, writeBatch, query, where, orderBy, limit, Timestamp
} from 'firebase/firestore';

// Collections
const salesCol = collection(db, 'sales');
const productsCol = collection(db, 'products');
const recipesCol = collection(db, 'recipes');
const inventoryCol = collection(db, 'inventory');

// Real-time subscription to sales
export const subscribeToSales = (onChange) => {
  return onSnapshot(salesCol, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(items);
  });
};

// Process sale and consume inventory based on recipes
export const processSaleAndConsumeInventory = async ({ cartItems, payment }) => {
  try {
    console.log('Processing sale with inventory consumption...', { cartItemsCount: cartItems.length });
    
    const batch = writeBatch(db);

    // Generate custom sale ID: SALE-YYYYMMDD-HHMMSS with milliseconds for uniqueness
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    const saleId = `SALE-${dateStr}-${timeStr}-${ms}`;

    // Prepare sale document with custom ID
    const saleRef = doc(db, 'sales', saleId);
    const items = cartItems.map(i => ({ 
      productId: i.id, 
      sku: i.sku,
      name: i.name, 
      price: i.price, 
      quantity: i.quantity,
      hasRecipe: i.hasRecipe || false,
      recipeId: i.recipeId || null
    }));
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    batch.set(saleRef, {
      saleId,
      items,
      total,
      paymentMethod: payment.paymentMethod,
      amountReceived: payment.amountReceived || 0,
      referenceNumber: payment.referenceNumber || '',
      inventoryConsumed: [], // Will be populated after inventory consumption
      createdAt: serverTimestamp(),
      date: now.toISOString(),
    });

    // Process each item and consume inventory if it has a recipe
    const inventoryConsumed = [];
    
    for (const item of cartItems) {
      console.log('Processing item for inventory consumption:', item);
      
      if (item.hasRecipe && item.recipeId) {
        // Get recipe and consume inventory
        const recipe = await getRecipeById(item.recipeId);
        if (recipe) {
          const consumedIngredients = await consumeInventoryFromRecipe(recipe.id, item.quantity, batch);
          inventoryConsumed.push({
            productSku: item.sku,
            productName: item.name,
            quantity: item.quantity,
            recipeId: recipe.id,
            recipeName: recipe.name,
            consumedIngredients
          });
        }
      }
    }

    // Update sale document with inventory consumption details
    batch.update(saleRef, {
      inventoryConsumed
    });

    await batch.commit();
    console.log('Sale processed and inventory consumed successfully');
    return saleId;
  } catch (error) {
    console.error('Error processing sale and consuming inventory:', error);
    throw error;
  }
};

// Consume inventory from recipe (without batch for individual use)
export const consumeInventoryFromRecipe = async (recipeId, quantity, batch = null) => {
  try {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }
    
    const consumedIngredients = [];
    const localBatch = batch || writeBatch(db);
    
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = await getInventoryItemBySKU(ingredient.sku);
      if (!inventoryItem) {
        throw new Error(`Inventory item ${ingredient.sku} not found`);
      }
      
      const consumedQuantity = ingredient.quantity * quantity;
      const newStock = Math.max(0, inventoryItem.currentStock - consumedQuantity);
      
      // Update inventory
      const inventoryRef = doc(db, 'inventory', ingredient.sku);
      localBatch.update(inventoryRef, { 
        currentStock: newStock,
        status: newStock <= inventoryItem.minStockLevel ? 'low-stock' : 'active',
        updatedAt: serverTimestamp()
      });
      
      consumedIngredients.push({
        sku: ingredient.sku,
        name: ingredient.name,
        quantity: consumedQuantity,
        unit: ingredient.unit,
        previousStock: inventoryItem.currentStock,
        newStock
      });
      
      // Log the adjustment
      await addInventoryAdjustment({
        sku: ingredient.sku,
        itemName: inventoryItem.name,
        previousStock: inventoryItem.currentStock,
        newStock,
        quantity: consumedQuantity,
        operation: 'subtract',
        reason: `Sale consumption: ${recipe.name}`,
        recipeId,
        adjustedBy: 'system',
        timestamp: serverTimestamp()
      });
    }
    
    if (!batch) {
      await localBatch.commit();
    }
    
    return consumedIngredients;
  } catch (error) {
    console.error('Error consuming inventory from recipe:', error);
    throw error;
  }
};

// Get sales with optional filtering
export const getSales = async (options = {}) => {
  try {
    console.log('Fetching sales with options:', options);
    
    let q = query(salesCol, orderBy('createdAt', 'desc'));
    
    // Apply date filtering if specified
    if (options.dateRange) {
      const now = new Date();
      let startDate;
      
      switch (options.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        default:
          // No date filter
          break;
      }
      
      if (startDate) {
        q = query(
          salesCol, 
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          orderBy('createdAt', 'desc')
        );
      }
    }
    
    // Apply limit if specified
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const sales = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({ 
        id: doc.id, 
        saleId: data.saleId,
        total: data.total || 0,
        items: data.items || [],
        paymentMethod: data.paymentMethod || 'Cash',
        inventoryConsumed: data.inventoryConsumed || [],
        date: data.date || data.createdAt?.toDate?.() || new Date(),
        createdAt: data.createdAt,
        ...data 
      });
    });
    
    console.log(`Fetched ${sales.length} sales`);
    return sales;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

// Get a specific sale by ID
export const getSaleById = async (saleId) => {
  try {
    const docRef = doc(db, 'sales', saleId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Failed to get sale:', error);
    throw error;
  }
};

// Get sales by date range
export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      salesCol,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sales = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        saleId: data.saleId,
        total: data.total || 0,
        items: data.items || [],
        paymentMethod: data.paymentMethod || 'Cash',
        inventoryConsumed: data.inventoryConsumed || [],
        date: data.date || data.createdAt?.toDate?.() || new Date(),
        createdAt: data.createdAt
      });
    });
    
    return sales;
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    return [];
  }
};

// Get top selling products
export const getTopSellingProducts = async (limitCount = 5, dateRange = 'month') => {
  try {
    // Get sales from the specified date range
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    const q = query(
      salesCol,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const productSales = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const items = data.items || [];
      
      items.forEach((item) => {
        const productSku = item.sku;
        if (!productSales[productSku]) {
          productSales[productSku] = {
            sku: productSku,
            name: item.name,
            totalQuantity: 0,
            totalRevenue: 0,
            totalSales: 0
          };
        }
        productSales[productSku].totalQuantity += item.quantity || 0;
        productSales[productSku].totalRevenue += (item.price || 0) * (item.quantity || 0);
        productSales[productSku].totalSales += 1;
      });
    });
    
    // Convert to array and sort by revenue
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limitCount);
    
    return topProducts;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return [];
  }
};

// Get inventory consumption report
export const getInventoryConsumptionReport = async (dateRange = 'month') => {
  try {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    const q = query(
      salesCol,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const consumption = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const inventoryConsumed = data.inventoryConsumed || [];
      
      inventoryConsumed.forEach((consumptionItem) => {
        consumptionItem.consumedIngredients.forEach((ingredient) => {
          const sku = ingredient.sku;
          if (!consumption[sku]) {
            consumption[sku] = {
              sku: sku,
              name: ingredient.name,
              totalQuantity: 0,
              unit: ingredient.unit,
              totalCost: 0
            };
          }
          consumption[sku].totalQuantity += ingredient.quantity;
        });
      });
    });
    
    // Calculate costs
    for (const sku in consumption) {
      const inventoryItem = await getInventoryItemBySKU(sku);
      if (inventoryItem) {
        consumption[sku].totalCost = consumption[sku].totalQuantity * inventoryItem.costPerUnit;
      }
    }
    
    return Object.values(consumption);
  } catch (error) {
    console.error('Error fetching inventory consumption report:', error);
    return [];
  }
};

// Helper functions
const getRecipeById = async (recipeId) => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
};

const getInventoryItemBySKU = async (sku) => {
  try {
    const docRef = doc(db, 'inventory', sku);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
};

const addInventoryAdjustment = async (adjustment) => {
  try {
    const adjustmentsCol = collection(db, 'inventory_adjustments');
    await addDoc(adjustmentsCol, {
      ...adjustment,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging inventory adjustment:', error);
  }
};


