import { db } from '../../firebaseConfig';
import { 
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot, serverTimestamp, writeBatch, query, where, orderBy
} from 'firebase/firestore';

// Collections
const productsCol = collection(db, 'products');
const salesCol = collection(db, 'sales');

// Real-time subscription to products
export const subscribeToProducts = (onChange) => {
  return onSnapshot(productsCol, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(items);
  });
};

export const addProductDoc = async (product) => {
  const data = {
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    price: product.price,
    cost: product.cost,
    category: product.category,
    status: product.status || (product.stock <= 10 ? 'low-stock' : 'active'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Use SKU as document ID for easier reference
  const docRef = doc(db, 'products', product.sku);
  await setDoc(docRef, data);
  return product.sku;
};

export const updateProductDoc = async (productId, updates) => {
  const ref = doc(db, 'products', productId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

export const writeSaleAndDecrementStock = async ({ cartItems, payment }) => {
  try {
    console.log('Starting Firestore transaction...', { cartItemsCount: cartItems.length });
    
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
      quantity: i.quantity 
    }));
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    batch.set(saleRef, {
      saleId,
      items,
      total,
      paymentMethod: payment.paymentMethod,
      amountReceived: payment.amountReceived || 0,
      referenceNumber: payment.referenceNumber || '',
      createdAt: serverTimestamp(),
      date: now.toISOString(),
    });

    // Decrement stock for each product
    for (const item of cartItems) {
      console.log('Processing item for stock update:', item);
      
      // Try to find product by SKU first, then by ID
      let pRef = doc(db, 'products', String(item.id));
      let snap = await getDoc(pRef);
      
      // If not found by ID, try by SKU (for backward compatibility)
      if (!snap.exists() && item.sku) {
        console.log(`Product not found by ID ${item.id}, trying SKU ${item.sku}`);
        pRef = doc(db, 'products', item.sku);
        snap = await getDoc(pRef);
      }
      
      if (!snap.exists()) {
        console.warn(`Product ${item.id} not found in Firestore, skipping stock update`);
        continue;
      }
      
      const curr = snap.data();
      console.log(`Current stock for ${item.name}: ${curr.stock}, reducing by ${item.quantity}`);
      const nextStock = Math.max(0, (curr.stock || 0) - item.quantity);
      batch.update(pRef, { stock: nextStock, status: nextStock <= 10 ? 'low-stock' : 'active', updatedAt: serverTimestamp() });
    }

    await batch.commit();
    console.log('Firestore transaction completed successfully');
    return saleId;
  } catch (error) {
    console.error('Firestore transaction failed:', error);
    
    // If batch fails, try individual operations as fallback
    try {
      console.log('Attempting fallback: individual operations...');
      
      // Create sale document individually
      const saleRef = doc(db, 'sales', saleId);
      const items = cartItems.map(i => ({ 
        productId: i.id, 
        sku: i.sku,
        name: i.name, 
        price: i.price, 
        quantity: i.quantity 
      }));
      const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
      
      await setDoc(saleRef, {
        saleId,
        items,
        total,
        paymentMethod: payment.paymentMethod,
        amountReceived: payment.amountReceived || 0,
        referenceNumber: payment.referenceNumber || '',
        createdAt: serverTimestamp(),
        date: new Date().toISOString(),
      });
      
      console.log('Fallback sale creation successful');
      return saleId;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw error; // Throw original error
    }
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
          where('createdAt', '>=', startDate),
          orderBy('createdAt', 'desc')
        );
      }
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
