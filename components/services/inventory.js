import { db } from '../../firebaseConfig';
import { 
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot, serverTimestamp, writeBatch, query, where, orderBy
} from 'firebase/firestore';

// Collections
const inventoryCol = collection(db, 'inventory');
const productsCol = collection(db, 'products');
const recipesCol = collection(db, 'recipes');

// Real-time subscription to inventory items
export const subscribeToInventory = (onChange) => {
  return onSnapshot(inventoryCol, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(items);
  });
};

// Add new inventory item (raw material)
export const addInventoryItem = async (item) => {
  const data = {
    name: item.name,
    sku: item.sku,
    currentStock: item.currentStock || 0,
    unit: item.unit, // e.g., 'kg', 'pieces', 'liters'
    costPerUnit: item.costPerUnit || 0,
    supplier: item.supplier || '',
    category: item.category || 'Raw Material',
    minStockLevel: item.minStockLevel || 10,
    maxStockLevel: item.maxStockLevel || 100,
    status: item.currentStock <= (item.minStockLevel || 10) ? 'low-stock' : 'active',
    location: item.location || 'Warehouse',
    notes: item.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Use SKU as document ID for easier reference
  const docRef = doc(db, 'inventory', item.sku);
  await setDoc(docRef, data);
  return item.sku;
};

// Update inventory item
export const updateInventoryItem = async (itemId, updates) => {
  const ref = doc(db, 'inventory', itemId);
  const updatedData = { ...updates, updatedAt: serverTimestamp() };
  
  // Update status based on stock level
  if (updates.currentStock !== undefined) {
    const item = await getDoc(ref);
    if (item.exists()) {
      const data = item.data();
      const minStock = updates.minStockLevel || data.minStockLevel || 10;
      updatedData.status = updates.currentStock <= minStock ? 'low-stock' : 'active';
    }
  }
  
  await updateDoc(ref, updatedData);
};

// Get inventory item by SKU
export const getInventoryItemBySKU = async (sku) => {
  try {
    const docRef = doc(db, 'inventory', sku);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
};

// Get all inventory items
export const getAllInventoryItems = async () => {
  try {
    const querySnapshot = await getDocs(inventoryCol);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

// Get low stock inventory items
export const getLowStockInventory = async () => {
  try {
    // First try with ordering (requires index)
    try {
      const q = query(
        inventoryCol,
        where('status', '==', 'low-stock'),
        orderBy('currentStock', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (indexError) {
      // If index doesn't exist, fall back to simple query and sort in memory
      console.log('Index not ready, using fallback query...');
      const q = query(
        inventoryCol,
        where('status', '==', 'low-stock')
      );
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in memory
      return items.sort((a, b) => (a.currentStock || 0) - (b.currentStock || 0));
    }
  } catch (error) {
    console.error('Error fetching low stock inventory:', error);
    throw error;
  }
};

// Adjust inventory stock
export const adjustInventoryStock = async (sku, quantity, operation = 'add', reason = 'manual') => {
  try {
    const item = await getInventoryItemBySKU(sku);
    if (!item) {
      throw new Error(`Inventory item with SKU ${sku} not found`);
    }
    
    let newStock = item.currentStock;
    if (operation === 'add') {
      newStock += quantity;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, newStock - quantity);
    } else if (operation === 'set') {
      newStock = quantity;
    }
    
    await updateInventoryItem(sku, { currentStock: newStock });
    
    // Log the adjustment
    await addInventoryAdjustment({
      sku,
      itemName: item.name,
      previousStock: item.currentStock,
      newStock,
      quantity,
      operation,
      reason,
      adjustedBy: 'system', // This should be the current user
      timestamp: serverTimestamp()
    });
    
    return newStock;
  } catch (error) {
    console.error('Error adjusting inventory stock:', error);
    throw error;
  }
};

// Add inventory adjustment log
export const addInventoryAdjustment = async (adjustment) => {
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

// Get inventory adjustments history
export const getInventoryAdjustments = async (sku = null, limit = 50) => {
  try {
    let q = query(
      collection(db, 'inventory_adjustments'),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    if (sku) {
      q = query(
        collection(db, 'inventory_adjustments'),
        where('sku', '==', sku),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching inventory adjustments:', error);
    throw error;
  }
};

// Bulk update inventory from recipe consumption
export const consumeInventoryFromRecipe = async (recipeId, quantity) => {
  try {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }
    
    const batch = writeBatch(db);
    const adjustments = [];
    
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = await getInventoryItemBySKU(ingredient.sku);
      if (!inventoryItem) {
        throw new Error(`Inventory item ${ingredient.sku} not found`);
      }
      
      const consumedQuantity = ingredient.quantity * quantity;
      const newStock = Math.max(0, inventoryItem.currentStock - consumedQuantity);
      
      // Update inventory
      const inventoryRef = doc(db, 'inventory', ingredient.sku);
      batch.update(inventoryRef, { 
        currentStock: newStock,
        status: newStock <= inventoryItem.minStockLevel ? 'low-stock' : 'active',
        updatedAt: serverTimestamp()
      });
      
      // Prepare adjustment log
      adjustments.push({
        sku: ingredient.sku,
        itemName: inventoryItem.name,
        previousStock: inventoryItem.currentStock,
        newStock,
        quantity: consumedQuantity,
        operation: 'subtract',
        reason: `Recipe consumption: ${recipe.name}`,
        recipeId,
        adjustedBy: 'system',
        timestamp: serverTimestamp()
      });
    }
    
    await batch.commit();
    
    // Log all adjustments
    for (const adjustment of adjustments) {
      await addInventoryAdjustment(adjustment);
    }
    
    return true;
  } catch (error) {
    console.error('Error consuming inventory from recipe:', error);
    throw error;
  }
};

// Get inventory item by ID (for backward compatibility)
export const getInventoryItemById = async (id) => {
  try {
    const docRef = doc(db, 'inventory', id);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
};

// Delete inventory item
export const deleteInventoryItem = async (sku) => {
  try {
    const docRef = doc(db, 'inventory', sku);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};
