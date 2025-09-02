import { db } from '../../firebaseConfig';
import { 
  collection, doc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, limit, Timestamp
} from 'firebase/firestore';

// Collections
const salesCol = collection(db, 'sales');
const productsCol = collection(db, 'products');
const inventoryCol = collection(db, 'inventory');

// Get today's sales summary
export const getTodaySalesSummary = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      salesCol,
      where('createdAt', '>=', Timestamp.fromDate(today)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    let totalSales = 0;
    let transactionCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalSales += data.total || 0;
      transactionCount++;
    });
    
    return {
      totalSales,
      transactionCount,
      averageTransaction: transactionCount > 0 ? totalSales / transactionCount : 0
    };
  } catch (error) {
    console.error('Error fetching today\'s sales summary:', error);
    return { totalSales: 0, transactionCount: 0, averageTransaction: 0 };
  }
};

// Get recent transactions
export const getRecentTransactions = async (limitCount = 5) => {
  try {
    const q = query(
      salesCol,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.createdAt?.toDate?.() || new Date(data.date) || new Date();
      
      transactions.push({
        id: doc.id,
        saleId: data.saleId,
        description: `Sale #${data.saleId || doc.id}`,
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        amount: `₱${(data.total || 0).toFixed(2)}`,
        total: data.total || 0,
        items: data.items || [],
        paymentMethod: data.paymentMethod || 'Cash',
        date: date
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
};

// Get low stock items (now from inventory collection)
export const getLowStockItems = async (threshold = 10) => {
  try {
    // First try with ordering (requires index)
    try {
      const q = query(
        inventoryCol,
        where('status', '==', 'low-stock'),
        orderBy('currentStock', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const lowStockItems = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lowStockItems.push({
          id: doc.id,
          name: data.name,
          sku: data.sku,
          stock: data.currentStock || 0,
          threshold: data.minStockLevel || threshold,
          category: data.category,
          unit: data.unit
        });
      });
      
      return lowStockItems;
    } catch (indexError) {
      // If index doesn't exist, fall back to simple query and sort in memory
      console.log('Index not ready, using fallback query...');
      const q = query(
        inventoryCol,
        where('status', '==', 'low-stock')
      );
      
      const querySnapshot = await getDocs(q);
      const lowStockItems = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lowStockItems.push({
          id: doc.id,
          name: data.name,
          sku: data.sku,
          stock: data.currentStock || 0,
          threshold: data.minStockLevel || threshold,
          category: data.category,
          unit: data.unit
        });
      });
      
      // Sort in memory
      return lowStockItems.sort((a, b) => a.stock - b.stock);
    }
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return [];
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's sales
    const todayQuery = query(
      salesCol,
      where('createdAt', '>=', Timestamp.fromDate(today)),
      orderBy('createdAt', 'desc')
    );
    
    const todaySnapshot = await getDocs(todayQuery);
    let todaySales = 0;
    let todayTransactions = 0;
    
    todaySnapshot.forEach((doc) => {
      const data = doc.data();
      todaySales += data.total || 0;
      todayTransactions++;
    });
    
    // Get total products count
    const productsSnapshot = await getDocs(productsCol);
    const totalProducts = productsSnapshot.size;
    
    // Get total inventory items count
    const inventorySnapshot = await getDocs(inventoryCol);
    const totalInventoryItems = inventorySnapshot.size;
    
    // Get low stock count
    const lowStockQuery = query(
      inventoryCol,
      where('status', '==', 'low-stock')
    );
    const lowStockSnapshot = await getDocs(lowStockQuery);
    const lowStockCount = lowStockSnapshot.size;
    
    // Get session start time (for demo purposes, using app start time)
    const sessionStartTime = new Date();
    
    return {
      todaySales,
      todayTransactions,
      totalProducts,
      totalInventoryItems,
      lowStockCount,
      sessionStartTime,
      averageTransaction: todayTransactions > 0 ? todaySales / todayTransactions : 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      todaySales: 0,
      todayTransactions: 0,
      totalProducts: 0,
      totalInventoryItems: 0,
      lowStockCount: 0,
      sessionStartTime: new Date(),
      averageTransaction: 0
    };
  }
};

// Real-time subscription for dashboard data
export const subscribeToDashboardData = (onDataChange) => {
  const unsubscribeSales = onSnapshot(salesCol, async () => {
    // When sales change, fetch updated dashboard data
    const stats = await getDashboardStats();
    const recentTransactions = await getRecentTransactions(5);
    const lowStockItems = await getLowStockItems(10);
    
    onDataChange({
      stats,
      recentTransactions,
      lowStockItems
    });
  });
  
  const unsubscribeProducts = onSnapshot(productsCol, async () => {
    // When products change, fetch updated dashboard data
    const stats = await getDashboardStats();
    const lowStockItems = await getLowStockItems(10);
    
    onDataChange({
      stats,
      lowStockItems
    });
  });
  
  // Return cleanup function
  return () => {
    unsubscribeSales();
    unsubscribeProducts();
  };
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
        date: data.createdAt?.toDate?.() || new Date(data.date) || new Date(),
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
export const getTopSellingProducts = async (limitCount = 5) => {
  try {
    // Get all sales from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const q = query(
      salesCol,
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const productSales = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const items = data.items || [];
      
      items.forEach((item) => {
        const productId = item.productId || item.sku;
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: item.name,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productSales[productId].totalQuantity += item.quantity || 0;
        productSales[productId].totalRevenue += (item.price || 0) * (item.quantity || 0);
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
