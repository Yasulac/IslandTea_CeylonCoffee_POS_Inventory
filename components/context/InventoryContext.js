import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeToProducts, addProductDoc, updateProductDoc } from '../services/firestore';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([]);

  // Firestore subscription
  useEffect(() => {
    console.log('Setting up Firestore subscription...');
    const unsub = subscribeToProducts((items) => {
      console.log('Received products from Firestore:', items.length);
      setInventoryItems(items);
    });
    return () => unsub();
  }, []);

  const recomputeStatuses = (items) => {
    return items.map(item => ({
      ...item,
      status: item.stock <= 10 ? 'low-stock' : 'active',
    }));
  };

  const lowStockItems = useMemo(() => (
    inventoryItems
      .filter(i => i.stock <= 10)
      .map(i => ({ id: i.id, name: i.name, stock: i.stock, threshold: 10 }))
  ), [inventoryItems]);

  const addProduct = async (product) => {
    await addProductDoc(product);
  };

  const updateProduct = async (productId, updates) => {
    await updateProductDoc(productId, updates);
  };

  const adjustStockById = (productId, delta) => {
    setInventoryItems(prev => {
      const next = prev.map(item => item.id === productId ? { ...item, stock: Math.max(0, item.stock + delta) } : item);
      return recomputeStatuses(next);
    });
  };

  const adjustStockByName = (productName, delta) => {
    setInventoryItems(prev => {
      const next = prev.map(item => item.name === productName ? { ...item, stock: Math.max(0, item.stock + delta) } : item);
      return recomputeStatuses(next);
    });
  };

  const value = {
    inventoryItems,
    lowStockItems,
    addProduct,
    updateProduct,
    adjustStockById,
    adjustStockByName,
    setInventoryItems, // expose setter for advanced cases
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};


