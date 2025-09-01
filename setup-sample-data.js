// setup-sample-data.js
import { db } from './firebaseConfig';
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';

const addSampleData = async () => {
  try {
    console.log('Adding sample data to Firebase...');

    // Add sample products
    const productsCol = collection(db, 'products');
    
    const sampleProducts = [
      {
        name: 'Ceylon Black Tea',
        sku: 'TEA001',
        stock: 5,
        price: 120.00,
        cost: 80.00,
        category: 'Tea',
        status: 'low-stock',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Arabica Coffee Beans',
        sku: 'COF001',
        stock: 8,
        price: 150.00,
        cost: 100.00,
        category: 'Coffee',
        status: 'low-stock',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Green Tea Leaves',
        sku: 'TEA002',
        stock: 25,
        price: 95.00,
        cost: 60.00,
        category: 'Tea',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Robusta Coffee',
        sku: 'COF002',
        stock: 30,
        price: 130.00,
        cost: 85.00,
        category: 'Coffee',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        name: 'Milk Powder',
        sku: 'MILK001',
        stock: 3,
        price: 45.00,
        cost: 30.00,
        category: 'Dairy',
        status: 'low-stock',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    ];

    for (const product of sampleProducts) {
      await setDoc(doc(productsCol, product.sku), product);
      console.log(`Added product: ${product.name}`);
    }

    // Add sample sales
    const salesCol = collection(db, 'sales');
    
    const sampleSales = [
      {
        saleId: 'SALE-20241201-143022-001',
        items: [
          { productId: 'TEA001', sku: 'TEA001', name: 'Ceylon Black Tea', price: 120.00, quantity: 2 },
          { productId: 'COF001', sku: 'COF001', name: 'Arabica Coffee Beans', price: 150.00, quantity: 1 }
        ],
        total: 390.00,
        paymentMethod: 'Cash',
        amountReceived: 400.00,
        referenceNumber: '',
        createdAt: serverTimestamp(),
        date: new Date('2024-12-01T14:30:22').toISOString(),
      },
      {
        saleId: 'SALE-20241201-151545-002',
        items: [
          { productId: 'TEA002', sku: 'TEA002', name: 'Green Tea Leaves', price: 95.00, quantity: 3 },
          { productId: 'MILK001', sku: 'MILK001', name: 'Milk Powder', price: 45.00, quantity: 1 }
        ],
        total: 330.00,
        paymentMethod: 'GCash',
        amountReceived: 330.00,
        referenceNumber: 'GC123456789',
        createdAt: serverTimestamp(),
        date: new Date('2024-12-01T15:15:45').toISOString(),
      },
      {
        saleId: 'SALE-20241201-162030-003',
        items: [
          { productId: 'COF002', sku: 'COF002', name: 'Robusta Coffee', price: 130.00, quantity: 2 }
        ],
        total: 260.00,
        paymentMethod: 'Card',
        amountReceived: 260.00,
        referenceNumber: 'CARD987654321',
        createdAt: serverTimestamp(),
        date: new Date('2024-12-01T16:20:30').toISOString(),
      },
      {
        saleId: 'SALE-20241201-170500-004',
        items: [
          { productId: 'TEA001', sku: 'TEA001', name: 'Ceylon Black Tea', price: 120.00, quantity: 1 },
          { productId: 'COF001', sku: 'COF001', name: 'Arabica Coffee Beans', price: 150.00, quantity: 1 },
          { productId: 'TEA002', sku: 'TEA002', name: 'Green Tea Leaves', price: 95.00, quantity: 1 }
        ],
        total: 365.00,
        paymentMethod: 'Cash',
        amountReceived: 400.00,
        referenceNumber: '',
        createdAt: serverTimestamp(),
        date: new Date('2024-12-01T17:05:00').toISOString(),
      },
      {
        saleId: 'SALE-20241201-181200-005',
        items: [
          { productId: 'MILK001', sku: 'MILK001', name: 'Milk Powder', price: 45.00, quantity: 2 },
          { productId: 'COF002', sku: 'COF002', name: 'Robusta Coffee', price: 130.00, quantity: 1 }
        ],
        total: 220.00,
        paymentMethod: 'Maya',
        amountReceived: 220.00,
        referenceNumber: 'MAYA111222333',
        createdAt: serverTimestamp(),
        date: new Date('2024-12-01T18:12:00').toISOString(),
      }
    ];

    for (const sale of sampleSales) {
      await setDoc(doc(salesCol, sale.saleId), sale);
      console.log(`Added sale: ${sale.saleId}`);
    }

    console.log('Sample data added successfully!');
    console.log('Products added:', sampleProducts.length);
    console.log('Sales added:', sampleSales.length);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};

// Run the function if this file is executed directly
if (typeof window === 'undefined') {
  addSampleData();
}

export default addSampleData;
