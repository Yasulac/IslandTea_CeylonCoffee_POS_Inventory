import React, { createContext, useContext, useMemo, useState } from 'react';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: 'Wintermelon Milk Tea', sku: 'A123', stock: 20, price: 4.50, cost: 3.20, category: 'Milk Tea', status: 'active' },
    { id: 2, name: 'Ceylon Black Tea', sku: '1001', stock: 15, price: 3.00, cost: 2.10, category: 'Tea', status: 'active' },
    { id: 3, name: 'Arabica Coffee Beans', sku: 'B456', stock: 8, price: 5.50, cost: 4.20, category: 'Coffee', status: 'low-stock' },
    { id: 4, name: 'Taro Powder', sku: 'C789', stock: 25, price: 2.80, cost: 1.90, category: 'Powder', status: 'active' },
    { id: 5, name: 'Milk Powder', sku: 'D012', stock: 5, price: 3.20, cost: 2.50, category: 'Powder', status: 'low-stock' },
    { id: 6, name: 'Brown Sugar Syrup', sku: 'E345', stock: 18, price: 1.50, cost: 0.80, category: 'Syrup', status: 'active' },
  ]);

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

  const addProduct = (product) => {
    setInventoryItems(prev => {
      const next = [{ ...product, id: Date.now() }, ...prev];
      return recomputeStatuses(next);
    });
  };

  const updateProduct = (productId, updates) => {
    setInventoryItems(prev => {
      const next = prev.map(item => item.id === productId ? { ...item, ...updates } : item);
      return recomputeStatuses(next);
    });
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


