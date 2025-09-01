import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import POSSaleScreen from './POSSaleScreen';
import InventoryManagementScreen from './InventoryManagementScreen';
import ReportsScreen from './ReportsScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import { useDashboard } from '../context/DashboardContext';

const DashboardScreen = ({ onLogout, selectedRole = 'Admin', currentUser }) => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [sessionTime, setSessionTime] = useState('00:00:00');
  
  // Get dashboard data from context
  const { 
    stats, 
    recentTransactions, 
    lowStockItems, 
    isLoading, 
    error, 
    refreshDashboard, 
    formatCurrency, 
    formatSessionTime 
  } = useDashboard();

  const navigationItems = [
    { id: 1, title: 'POS / Sales', icon: 'desktop-outline', isActive: true, screen: 'dashboard' },
    { id: 2, title: 'Inventory', icon: 'cube-outline', isActive: false, screen: 'inventory', adminOnly: true },
    { id: 3, title: 'Reports', icon: 'bar-chart-outline', isActive: false, screen: 'reports' },
    { id: 4, title: 'Settings', icon: 'settings-outline', isActive: false, screen: 'settings', adminOnly: true },
    { id: 5, title: 'Profile', icon: 'person-outline', isActive: false, screen: 'profile' },
  ];

  const quickButtons = [
    { id: 1, title: 'Quick Sale', icon: 'add-circle-outline' },
    { id: 2, title: 'View Reports', icon: 'bar-chart-outline' },
    { id: 3, title: 'Inventory', icon: 'cube-outline' },
    { id: 4, title: 'Settings', icon: 'settings-outline' },
    { id: 5, title: 'Profile', icon: 'person-outline' },
    { id: 6, title: 'Refresh', icon: 'refresh-outline' },
  ];

  // Update session time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(formatSessionTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [formatSessionTime]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  const handleStartSale = () => {
    setCurrentScreen('pos-sale');
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  // Show POS Sale Screen if currentScreen is 'pos-sale'
  if (currentScreen === 'pos-sale') {
    return <POSSaleScreen onBackToDashboard={handleBackToDashboard} selectedRole={selectedRole} />;
  }

  // Show Inventory Management Screen if currentScreen is 'inventory' and user is Admin
  if (currentScreen === 'inventory' && selectedRole === 'Admin') {
    return <InventoryManagementScreen onBackToDashboard={handleBackToDashboard} selectedRole={selectedRole} />;
  }

  // Show Reports Screen
  if (currentScreen === 'reports') {
    return <ReportsScreen onBackToDashboard={handleBackToDashboard} selectedRole={selectedRole} currentUser={currentUser} />;
  }

  // Show Settings Screen (Admin only)
  if (currentScreen === 'settings' && selectedRole === 'Admin') {
    return <SettingsScreen onBackToDashboard={handleBackToDashboard} selectedRole={selectedRole} />;
  }

  // Show Profile Screen
  if (currentScreen === 'profile') {
    return <ProfileScreen onBackToDashboard={handleBackToDashboard} onLogout={onLogout} selectedRole={selectedRole} currentUser={currentUser} />;
  }

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Dashboard</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshDashboard}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Island Tea & Ceylon Coffee POS</Text>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {currentUser?.email || selectedRole}</Text>
            <Text style={styles.roleText}>{selectedRole}</Text>
          </View>
          <View style={styles.userIcon}>
            <Ionicons name="person" size={24} color="#6B7280" />
          </View>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Left Sidebar Navigation */}
        <View style={styles.sidebar}>
          {navigationItems.map((item) => {
            // Skip admin-only items for non-admin users
            if (item.adminOnly && selectedRole !== 'Admin') {
              return null;
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem, 
                  currentScreen === item.screen && styles.navItemActive
                ]}
                onPress={() => handleNavigation(item.screen)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={currentScreen === item.screen ? '#8B5CF6' : '#6B7280'} 
                />
                <Text style={[
                  styles.navText, 
                  currentScreen === item.screen && styles.navTextActive
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Content Area */}
        <ScrollView 
          style={styles.mainContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Top Row - Sales Summary and Low Stock */}
          <View style={styles.topRow}>
            {/* Daily Sales Summary */}
            <View style={styles.salesSummaryCard}>
              <Text style={styles.salesAmount}>{formatCurrency(stats.todaySales)}</Text>
              <Text style={styles.salesLabel}>Daily Sales Summary</Text>
              <Text style={styles.salesSubtext}>{stats.todayTransactions} transactions today</Text>
            </View>

            {/* Low Stock Alerts */}
            <View style={styles.alertCard}>
              <Text style={styles.cardTitle}>Low Stock Alerts ({lowStockItems.length})</Text>
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.alertItem}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertItemName}>{item.name}</Text>
                      <Text style={styles.alertItemStock}>Stock: {item.stock}</Text>
                    </View>
                    <TouchableOpacity style={styles.closeButton}>
                      <Ionicons name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noAlertsText}>No low stock items</Text>
              )}
            </View>
          </View>

          {/* Middle Row - Stats and Action Buttons */}
          <View style={styles.middleRow}>
            {/* Stats Cards */}
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.todayTransactions}</Text>
                <Text style={styles.statLabel}>Today's Transactions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{sessionTime}</Text>
                <Text style={styles.statLabel}>Active Session</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={handleStartSale}>
                <Text style={styles.actionButtonText}>Start Sale</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.7}
                onPress={() => selectedRole === 'Admin' && handleNavigation('inventory')}
              >
                <Text style={styles.actionButtonText}>Add Inventory</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButtonSecondary} 
                activeOpacity={0.7}
                onPress={refreshDashboard}
              >
                <Ionicons name="refresh" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Row - Quick Buttons and Recent Transactions */}
          <View style={styles.bottomRow}>
            {/* Quick Buttons */}
            <View style={styles.quickButtonsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickButtonsGrid}>
                {quickButtons.map((button) => (
                  <TouchableOpacity 
                    key={button.id} 
                    style={styles.quickButton} 
                    activeOpacity={0.7}
                    onPress={() => {
                      switch(button.id) {
                        case 1: handleStartSale(); break;
                        case 2: handleNavigation('reports'); break;
                        case 3: selectedRole === 'Admin' && handleNavigation('inventory'); break;
                        case 4: selectedRole === 'Admin' && handleNavigation('settings'); break;
                        case 5: handleNavigation('profile'); break;
                        case 6: refreshDashboard(); break;
                        default: break;
                      }
                    }}
                  >
                    <Ionicons name={button.icon} size={24} color="#8B5CF6" />
                    <Text style={styles.quickButtonText}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionCard}>
              <Text style={styles.cardTitle}>Recent Transactions</Text>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionContent}>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                    </View>
                    <Text style={styles.transactionTime}>{transaction.time}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noTransactionsText}>No recent transactions</Text>
              )}
            </View>
          </View>

          {/* Additional Stats Row */}
          <View style={styles.additionalStatsRow}>
            <View style={styles.additionalStatCard}>
              <Text style={styles.additionalStatNumber}>{stats.totalProducts}</Text>
              <Text style={styles.additionalStatLabel}>Total Products</Text>
            </View>
            <View style={styles.additionalStatCard}>
              <Text style={styles.additionalStatNumber}>{stats.lowStockCount}</Text>
              <Text style={styles.additionalStatLabel}>Low Stock Items</Text>
            </View>
            <View style={styles.additionalStatCard}>
              <Text style={styles.additionalStatNumber}>{formatCurrency(stats.averageTransaction)}</Text>
              <Text style={styles.additionalStatLabel}>Avg. Transaction</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    backgroundColor: 'white',
    paddingVertical: 24,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 4,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#F3F4F6',
    borderRightWidth: 3,
    borderRightColor: '#8B5CF6',
  },
  navText: {
    marginLeft: 16,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 20,
  },
  salesSummaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  salesAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  salesLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  salesSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  alertCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  alertContent: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  alertItemStock: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  middleRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 20,
  },
  statsSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 20,
  },
  quickButtonsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickButton: {
    width: '48%',
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 4,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  transactionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    minWidth: 60,
    fontWeight: '500',
  },
  noTransactionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  additionalStatsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  additionalStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  additionalStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default DashboardScreen;
