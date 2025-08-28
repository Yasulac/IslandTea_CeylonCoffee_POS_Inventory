import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReportsScreen = ({ onBackToDashboard, selectedRole = 'Admin' }) => {
  const [activeTab, setActiveTab] = useState('transactions'); // 'sales' | 'inventory' | 'transactions'

  const SummaryCard = ({ label, value }) => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  const TabButton = ({ id, label }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === id && styles.tabButtonActive]}
      onPress={() => setActiveTab(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, activeTab === id && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

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
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Text style={styles.headerActionText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Text style={styles.headerActionText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Text style={styles.headerActionText}>Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filter} activeOpacity={0.7}>
            <Text style={styles.filterText}>Custom Range</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter} activeOpacity={0.7}>
            <Text style={styles.filterText}>Report Type</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter} activeOpacity={0.7}>
            <Text style={styles.filterText}>User</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Total Sales" value="P 25,430" />
          <SummaryCard label="# of Transactions" value="182" />
          <SummaryCard label="Avg. Sale Value" value="P 140" />
          <SummaryCard label="Top-Selling Items" value="Milk Tea" />
        </View>

        {/* Tabs + Chart + Table */}
        <View style={styles.panel}>
          <View style={styles.tabsRow}>
            <TabButton id="sales" label="Sales Report" />
            <TabButton id="inventory" label="Inventory Report" />
            <TabButton id="transactions" label="Transaction History" />
          </View>

          {/* Chart placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Line Graph</Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Transaction #</Text>
              <Text style={[styles.th, { flex: 1 }]}>Amount</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Payment Method</Text>
              <Text style={[styles.th, { flex: 1 }]}>Cashier</Text>
            </View>

            {[1,2,3,4,5].map((row) => (
              <View key={row} style={styles.tr}>
                <View style={[styles.tdSkeleton, { flex: 1.5 }]} />
                <View style={[styles.tdSkeleton, { flex: 1.2 }]} />
                <View style={[styles.tdSkeleton, { flex: 1 }]} />
                <View style={[styles.tdSkeleton, { flex: 1.2 }]} />
                <View style={[styles.tdSkeleton, { flex: 1 }]} />
              </View>
            ))}
          </View>
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
  tdSkeleton: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
});

export default ReportsScreen;
