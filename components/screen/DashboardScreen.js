import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import POSSaleScreen from './POSSaleScreen';
import InventoryManagementScreen from './InventoryManagementScreen';
import ReportsScreen from './ReportsScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';

const DashboardScreen = ({ onLogout, selectedRole = 'Admin' }) => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const navigationItems = [
    { id: 1, title: 'POS / Sales', icon: 'desktop-outline', isActive: true, screen: 'dashboard' },
    { id: 2, title: 'Inventory', icon: 'cube-outline', isActive: false, screen: 'inventory', adminOnly: true },
    { id: 3, title: 'Reports', icon: 'bar-chart-outline', isActive: false, screen: 'reports' },
    { id: 4, title: 'Settings', icon: 'settings-outline', isActive: false, screen: 'settings', adminOnly: true },
    { id: 5, title: 'Profile', icon: 'person-outline', isActive: false, screen: 'profile' },
  ];

  const quickButtons = [
    { id: 1, title: 'Quick Action 1' },
    { id: 2, title: 'Quick Action 2' },
    { id: 3, title: 'Quick Action 3' },
    { id: 4, title: 'Quick Action 4' },
    { id: 5, title: 'Quick Action 5' },
    { id: 6, title: 'Quick Action 6' },
  ];

  const lowStockItems = [
    { id: 1, item: 'Ceylon Tea Leaves' },
    { id: 2, item: 'Coffee Beans' },
    { id: 3, item: 'Milk Powder' },
  ];

  const recentTransactions = [
    { id: 1, description: 'Coffee Order #001', time: '5:12 PM', amount: 'P120' },
    { id: 2, description: 'Tea Order #002', time: '4:45 PM', amount: 'P85' },
    { id: 3, description: 'Snack Order #003', time: '3:30 PM', amount: 'P95' },
  ];

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
    return <ReportsScreen onBackToDashboard={handleBackToDashboard} selectedRole={selectedRole} />;
  }

  // Show Settings Screen (Admin only)
  if (currentScreen === 'settings' && selectedRole === 'Admin') {
    return <SettingsScreen onBackToDashboard={handleBackToDashboard} selectedRole={selectedRole} />;
  }

  // Show Profile Screen
  if (currentScreen === 'profile') {
    return <ProfileScreen onBackToDashboard={handleBackToDashboard} onLogout={onLogout} selectedRole={selectedRole} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Island Tea & Ceylon Coffee POS</Text>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {selectedRole}</Text>
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
        <View style={styles.mainContent}>
          {/* Top Row - Sales Summary and Low Stock */}
          <View style={styles.topRow}>
            {/* Daily Sales Summary */}
            <View style={styles.salesSummaryCard}>
              <Text style={styles.salesAmount}>P5,420 Today</Text>
              <Text style={styles.salesLabel}>Daily Sales Summary</Text>
            </View>

            {/* Low Stock Alerts */}
            <View style={styles.alertCard}>
              <Text style={styles.cardTitle}>Low Stock Alerts</Text>
              {lowStockItems.map((item) => (
                <View key={item.id} style={styles.alertItem}>
                  <TouchableOpacity style={styles.closeButton}>
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.alertPlaceholder} />
                </View>
              ))}
            </View>
          </View>

          {/* Middle Row - Stats and Action Buttons */}
          <View style={styles.middleRow}>
            {/* Stats Cards */}
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>42</Text>
                <Text style={styles.statLabel}>Total Transactions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>02:36:18</Text>
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
              <TouchableOpacity style={styles.actionButtonSecondary} activeOpacity={0.7}>
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Row - Quick Buttons and Recent Transactions */}
          <View style={styles.bottomRow}>
            {/* Quick Buttons */}
            <View style={styles.quickButtonsSection}>
              <Text style={styles.sectionTitle}>Quick Buttons</Text>
              <View style={styles.quickButtonsGrid}>
                {quickButtons.map((button) => (
                  <TouchableOpacity key={button.id} style={styles.quickButton} activeOpacity={0.7}>
                    <View style={styles.quickButtonPlaceholder} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionCard}>
              <Text style={styles.cardTitle}>Recent Transactions</Text>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <TouchableOpacity style={styles.closeButton}>
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.transactionPlaceholder} />
                  <Text style={styles.transactionTime}>{transaction.time}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertPlaceholder: {
    flex: 1,
    height: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 1,
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
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickButtonPlaceholder: {
    width: '60%',
    height: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 1,
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
  },
  transactionPlaceholder: {
    flex: 1,
    height: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 1,
    marginRight: 12,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    minWidth: 60,
    fontWeight: '500',
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
