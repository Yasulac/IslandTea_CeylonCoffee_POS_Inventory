import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getDashboardStats, 
  getRecentTransactions, 
  getLowStockItems, 
  subscribeToDashboardData 
} from '../services/dashboard';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      todaySales: 0,
      todayTransactions: 0,
      totalProducts: 0,
      lowStockCount: 0,
      sessionStartTime: new Date(),
      averageTransaction: 0
    },
    recentTransactions: [],
    lowStockItems: [],
    isLoading: true,
    error: null
  });

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('Initializing dashboard data...');
        
        const [stats, recentTransactions, lowStockItems] = await Promise.all([
          getDashboardStats(),
          getRecentTransactions(5),
          getLowStockItems(10)
        ]);

        setDashboardData({
          stats,
          recentTransactions,
          lowStockItems,
          isLoading: false,
          error: null
        });

        console.log('Dashboard data initialized:', { stats, recentTransactions: recentTransactions.length, lowStockItems: lowStockItems.length });
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    initializeDashboard();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!dashboardData.isLoading) {
      console.log('Setting up real-time dashboard subscriptions...');
      
      const unsubscribe = subscribeToDashboardData(({ stats, recentTransactions, lowStockItems }) => {
        setDashboardData(prev => ({
          ...prev,
          stats: stats || prev.stats,
          recentTransactions: recentTransactions || prev.recentTransactions,
          lowStockItems: lowStockItems || prev.lowStockItems
        }));
      });

      return () => {
        console.log('Cleaning up dashboard subscriptions...');
        unsubscribe();
      };
    }
  }, [dashboardData.isLoading]);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true }));
      
      const [stats, recentTransactions, lowStockItems] = await Promise.all([
        getDashboardStats(),
        getRecentTransactions(5),
        getLowStockItems(10)
      ]);

      setDashboardData({
        stats,
        recentTransactions,
        lowStockItems,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format session time
  const formatSessionTime = () => {
    const now = new Date();
    const sessionStart = dashboardData.stats.sessionStartTime;
    // Convert Firestore timestamp to Date if needed
    const sessionStartDate = sessionStart?.toDate?.() || sessionStart || now;
    const diffMs = now - sessionStartDate;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  };

  const value = {
    ...dashboardData,
    refreshDashboard,
    formatCurrency,
    formatSessionTime
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
};
