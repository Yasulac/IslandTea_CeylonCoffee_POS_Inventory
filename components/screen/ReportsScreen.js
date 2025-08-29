import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../context/InventoryContext';
import { getSales } from '../services/firestore';

const ReportsScreen = ({ onBackToDashboard, selectedRole = 'Admin' }) => {
  const [activeTab, setActiveTab] = useState('transactions'); // 'sales' | 'inventory' | 'transactions'
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today'); // 'today', 'week', 'month', 'custom'
  const { inventoryItems } = useInventory();

  const SummaryCard = ({ label, value }) => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  // Fetch sales data on component mount
  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const sales = await getSales({ dateRange });
      setSalesData(sales);
      console.log('Fetched sales data:', sales.length, 'transactions');
    } catch (error) {
      console.error('Error fetching sales data:', error);
      Alert.alert('Error', 'Failed to load sales data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSales = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const transactionCount = salesData.length;
    const avgSaleValue = transactionCount > 0 ? totalSales / transactionCount : 0;
    
    // Find top selling item
    const itemSales = {};
    salesData.forEach(sale => {
      sale.items?.forEach(item => {
        itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
      });
    });
    const topSellingItem = Object.keys(itemSales).length > 0 
      ? Object.keys(itemSales).reduce((a, b) => itemSales[a] > itemSales[b] ? a : b)
      : 'No sales';

    return {
      totalSales,
      transactionCount,
      avgSaleValue,
      topSellingItem
    };
  }, [salesData]);

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => (item.stock || 0) <= 10).length;
    const outOfStockItems = inventoryItems.filter(item => (item.stock || 0) === 0).length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue
    };
  }, [inventoryItems]);

  const TabButton = ({ id, label }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === id && styles.tabButtonActive]}
      onPress={() => setActiveTab(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, activeTab === id && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const formatCurrency = (amount) => {
    return `₱${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'Custom Range';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction} 
            activeOpacity={0.7}
            onPress={() => Alert.alert('Export', 'PDF export functionality coming soon!')}
          >
            <Text style={styles.headerActionText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction} 
            activeOpacity={0.7}
            onPress={() => Alert.alert('Export', 'CSV export functionality coming soon!')}
          >
            <Text style={styles.headerActionText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction} 
            activeOpacity={0.7}
            onPress={() => Alert.alert('Print', 'Print functionality coming soon!')}
          >
            <Text style={styles.headerActionText}>Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={styles.filter} 
            activeOpacity={0.7}
            onPress={() => {
              const ranges = ['today', 'week', 'month'];
              const currentIndex = ranges.indexOf(dateRange);
              const nextIndex = (currentIndex + 1) % ranges.length;
              setDateRange(ranges[nextIndex]);
            }}
          >
            <Text style={styles.filterText}>{getDateRangeText()}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filter} 
            activeOpacity={0.7}
            onPress={fetchSalesData}
          >
            <Text style={styles.filterText}>Refresh</Text>
            <Ionicons name="refresh" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Total Sales" value={formatCurrency(summaryStats.totalSales)} />
          <SummaryCard label="# of Transactions" value={summaryStats.transactionCount.toString()} />
          <SummaryCard label="Avg. Sale Value" value={formatCurrency(summaryStats.avgSaleValue)} />
          <SummaryCard label="Top-Selling Items" value={summaryStats.topSellingItem} />
        </View>

        {/* Tabs + Chart + Table */}
        <View style={styles.panel}>
          <View style={styles.tabsRow}>
            <TabButton id="sales" label="Sales Report" />
            <TabButton id="inventory" label="Inventory Report" />
            <TabButton id="transactions" label="Transaction History" />
          </View>

          {/* Content based on active tab */}
          {activeTab === 'sales' && (
            <>
              {/* Sales Chart placeholder */}
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>Sales Trend Chart</Text>
                <Text style={styles.chartSubtext}>Daily sales for {getDateRangeText()}</Text>
              </View>

              {/* Sales Summary */}
              <View style={styles.salesSummary}>
                <Text style={styles.sectionTitle}>Sales Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Total Revenue</Text>
                    <Text style={styles.summaryItemValue}>{formatCurrency(summaryStats.totalSales)}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Transactions</Text>
                    <Text style={styles.summaryItemValue}>{summaryStats.transactionCount}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Average Sale</Text>
                    <Text style={styles.summaryItemValue}>{formatCurrency(summaryStats.avgSaleValue)}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Best Seller</Text>
                    <Text style={styles.summaryItemValue}>{summaryStats.topSellingItem}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {activeTab === 'inventory' && (
            <>
              {/* Inventory Chart placeholder */}
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>Inventory Status Chart</Text>
                <Text style={styles.chartSubtext}>Stock levels and alerts</Text>
              </View>

              {/* Inventory Summary */}
              <View style={styles.inventorySummary}>
                <Text style={styles.sectionTitle}>Inventory Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Total Items</Text>
                    <Text style={styles.summaryItemValue}>{inventoryStats.totalItems}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Low Stock</Text>
                    <Text style={[styles.summaryItemValue, inventoryStats.lowStockItems > 0 && styles.warningText]}>
                      {inventoryStats.lowStockItems}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Out of Stock</Text>
                    <Text style={[styles.summaryItemValue, inventoryStats.outOfStockItems > 0 && styles.dangerText]}>
                      {inventoryStats.outOfStockItems}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Total Value</Text>
                    <Text style={styles.summaryItemValue}>{formatCurrency(inventoryStats.totalValue)}</Text>
                  </View>
                </View>

                {/* Low Stock Items List */}
                {inventoryStats.lowStockItems > 0 && (
                  <View style={styles.lowStockSection}>
                    <Text style={styles.sectionTitle}>Low Stock Items</Text>
                    {inventoryItems
                      .filter(item => (item.stock || 0) <= 10)
                      .slice(0, 5)
                      .map((item, index) => (
                        <View key={index} style={styles.lowStockItem}>
                          <Text style={styles.lowStockItemName}>{item.name}</Text>
                          <Text style={styles.lowStockItemStock}>Stock: {item.stock}</Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </>
          )}

          {activeTab === 'transactions' && (
            <>
              {/* Transaction Chart placeholder */}
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>Transaction Volume</Text>
                <Text style={styles.chartSubtext}>Daily transaction count</Text>
              </View>

              {/* Transactions Table */}
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 1.5 }]}>Date</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Transaction #</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Amount</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Payment Method</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Items</Text>
                </View>

                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <View key={index} style={styles.tr}>
                      <View style={[styles.tdSkeleton, { flex: 1.5 }]} />
                      <View style={[styles.tdSkeleton, { flex: 1.2 }]} />
                      <View style={[styles.tdSkeleton, { flex: 1 }]} />
                      <View style={[styles.tdSkeleton, { flex: 1.2 }]} />
                      <View style={[styles.tdSkeleton, { flex: 1 }]} />
                    </View>
                  ))
                ) : salesData.length > 0 ? (
                  // Actual data
                  salesData.slice(0, 10).map((sale, index) => (
                    <View key={sale.saleId || index} style={styles.tr}>
                      <Text style={[styles.td, { flex: 1.5 }]}>{formatDate(sale.date)}</Text>
                      <Text style={[styles.td, { flex: 1.2 }]}>{sale.saleId}</Text>
                      <Text style={[styles.td, { flex: 1 }]}>{formatCurrency(sale.total)}</Text>
                      <Text style={[styles.td, { flex: 1.2 }]}>{sale.paymentMethod || 'Cash'}</Text>
                      <Text style={[styles.td, { flex: 1 }]}>{sale.items?.length || 0} items</Text>
                    </View>
                  ))
                ) : (
                  // No data
                  <View style={styles.noDataRow}>
                    <Text style={styles.noDataText}>No transactions found for {getDateRangeText()}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerActionText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#C4B5FD',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#6D28D9',
  },
  chartPlaceholder: {
    height: 160,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  chartText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  chartSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  warningText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: '#EF4444',
  },
  lowStockSection: {
    marginTop: 16,
  },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    marginBottom: 4,
  },
  lowStockItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  lowStockItemStock: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  th: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
  },
  tr: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  td: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  tdSkeleton: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  noDataRow: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ReportsScreen;
