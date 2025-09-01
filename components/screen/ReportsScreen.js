import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
// Removed react-native-chart-kit import
import { useInventory } from '../context/InventoryContext';
import { getSales } from '../services/firestore';

const screenWidth = Dimensions.get('window').width;

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

  // Prepare chart data for sales trends
  const salesChartData = useMemo(() => {
    if (salesData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Group sales by date
    const salesByDate = {};
    salesData.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      salesByDate[date] = (salesByDate[date] || 0) + (sale.total || 0);
    });

    const labels = Object.keys(salesByDate).slice(-7); // Last 7 days
    const data = labels.map(date => salesByDate[date]);

    // Ensure we have at least 2 data points for the line chart
    if (labels.length === 1) {
      labels.push('Today');
      data.push(0);
    }

    console.log('Sales chart data:', { labels, data });
    return {
      labels,
      datasets: [{ data }]
    };
  }, [salesData]);

  // Log inventory chart data for debugging
  useEffect(() => {
    console.log('Inventory chart data:', inventoryChartData);
  }, [inventoryChartData]);

  // Log transaction chart data for debugging
  useEffect(() => {
    console.log('Transaction chart data:', transactionChartData);
  }, [transactionChartData]);

  // Prepare chart data for inventory status
  const inventoryChartData = useMemo(() => {
    const inStock = inventoryItems.filter(item => (item.stock || 0) > 10).length;
    const lowStock = inventoryItems.filter(item => (item.stock || 0) <= 10 && (item.stock || 0) > 0).length;
    const outOfStock = inventoryItems.filter(item => (item.stock || 0) === 0).length;

    // If no inventory items, show a placeholder
    if (inventoryItems.length === 0) {
      return [
        {
          name: 'No Items',
          population: 1,
          color: '#9CA3AF',
          legendFontColor: '#374151',
          legendFontSize: 12,
        }
      ];
    }

    return [
      {
        name: 'In Stock',
        population: inStock,
        color: '#10B981',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Low Stock',
        population: lowStock,
        color: '#F59E0B',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Out of Stock',
        population: outOfStock,
        color: '#EF4444',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
    ];
  }, [inventoryItems]);

  // Prepare chart data for transaction volume
  const transactionChartData = useMemo(() => {
    if (salesData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Group transactions by date
    const transactionsByDate = {};
    salesData.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      transactionsByDate[date] = (transactionsByDate[date] || 0) + 1;
    });

    const labels = Object.keys(transactionsByDate).slice(-7); // Last 7 days
    const data = labels.map(date => transactionsByDate[date]);

    // Ensure we have at least 2 data points for the bar chart
    if (labels.length === 1) {
      labels.push('Today');
      data.push(0);
    }

    return {
      labels,
      datasets: [{ data }]
    };
  }, [salesData]);

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(109, 40, 217, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6D28D9',
    },
    propsForLabels: {
      fontSize: 10,
    },
    strokeWidth: 2,
  };

  // Custom Chart Components
  const LineChart = ({ data, width, height }) => {
    if (!data || !data.labels || data.labels.length === 0) return null;
    
    const maxValue = Math.max(...data.datasets[0].data);
    const chartHeight = height - 80; // More space for labels
    const [selectedIndex, setSelectedIndex] = useState(null);

    const shouldShowLabel = (index, total) => {
      if (total <= 6) return true;
      const keyPoints = new Set([0, Math.floor(total / 2), total - 1]);
      return keyPoints.has(index);
    };
    
    return (
      <View style={[styles.customChart, { width, height }]}>        
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = maxValue * ratio;
            return (
              <Text key={index} style={styles.yAxisLabel}>
                ₱{value.toFixed(0)}
              </Text>
            );
          })}
        </View>
        
        {/* Main Chart Area */}
        <View style={styles.chartMainArea}>
          {/* Grid Lines */}
          <View style={styles.gridLines}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View 
                key={index} 
                style={[
                  styles.gridLine, 
                  { top: ratio * chartHeight }
                ]} 
              />
            ))}
          </View>
          
          {/* Data Points and Lines */}
          <View style={styles.chartDataContainer}>
            {data.labels.map((label, index) => {
              const value = data.datasets[0].data[index];
              const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
              const yPosition = chartHeight - barHeight;
              const isSelected = selectedIndex === index;
              
              return (
                <TouchableOpacity key={index} style={styles.chartColumn} activeOpacity={0.7} onPress={() => setSelectedIndex(index)}>
                  {/* Tooltip */}
                  {isSelected && (
                    <View style={[styles.tooltip, { bottom: yPosition + 24 }]}> 
                      <Text style={styles.tooltipText}>{label}</Text>
                      <Text style={styles.tooltipValue}>₱{value}</Text>
                    </View>
                  )}

                  {/* Data Point */}
                  <View 
                    style={[
                      styles.lineChartPoint, 
                      { 
                        bottom: yPosition,
                        backgroundColor: '#6D28D9'
                      }
                    ]} 
                  />
                  
                  {/* Connecting Line (except for last point) */}
                  {index < data.labels.length - 1 && (
                    <View 
                      style={[
                        styles.connectingLine,
                        {
                          bottom: yPosition + 5,
                          height: Math.abs(
                            (data.datasets[0].data[index + 1] / maxValue) * chartHeight - barHeight
                          )
                        }
                      ]} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        {/* X-axis labels */}
        <View style={styles.xAxisContainer}>
          {data.labels.map((label, index) => (
            <Text key={index} style={styles.xAxisLabel}>
              {shouldShowLabel(index, data.labels.length) ? label : ' '}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const BarChart = ({ data, width, height }) => {
    if (!data || !data.labels || data.labels.length === 0) return null;
    
    const maxValue = Math.max(...data.datasets[0].data);
    const chartHeight = height - 80;
    const [selectedIndex, setSelectedIndex] = useState(null);

    const shouldShowLabel = (index, total) => {
      if (total <= 6) return true;
      const keyPoints = new Set([0, Math.floor(total / 2), total - 1]);
      return keyPoints.has(index);
    };
    
    // Enhanced color scheme
    const chartColors = {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      grid: '#E5E7EB',
      text: '#6B7280',
      background: '#F9FAFB'
    };
    
    return (
      <View style={[styles.customChart, { width, height }]}>        
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = maxValue * ratio;
            return (
              <Text key={index} style={styles.yAxisLabel}>
                {value.toFixed(0)}
              </Text>
            );
          })}
        </View>
        
        {/* Main Chart Area */}
        <View style={styles.chartMainArea}>
          {/* Grid Lines */}
          <View style={styles.gridLines}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View 
                key={index} 
                style={[
                  styles.gridLine, 
                  { 
                    top: ratio * chartHeight,
                    backgroundColor: chartColors.grid
                  }
                ]} 
              />
            ))}
          </View>
          
          {/* Bars */}
          <View style={styles.chartDataContainer}>
            {data.labels.map((label, index) => {
              const value = data.datasets[0].data[index];
              const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
              const isSelected = selectedIndex === index;
              
              return (
                <TouchableOpacity key={index} style={styles.chartColumn} activeOpacity={0.7} onPress={() => setSelectedIndex(index)}>
                  {/* Tooltip */}
                  {isSelected && (
                    <View style={[styles.tooltip, { bottom: barHeight + 24 }]}> 
                      <Text style={styles.tooltipText}>{label}</Text>
                      <Text style={styles.tooltipValue}>{value}</Text>
                    </View>
                  )}

                  {/* Bar */}
                  <View 
                    style={[
                      styles.barChartBar, 
                      { 
                        height: Math.max(4, barHeight),
                        backgroundColor: chartColors.primary,
                        shadowColor: chartColors.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }
                    ]} 
                  />
                  
                  {/* Value on top of bar */}
                  <Text style={[styles.barValue, { color: chartColors.primary }]}>{value}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        {/* X-axis labels */}
        <View style={styles.xAxisContainer}>
          {data.labels.map((label, index) => (
            <Text key={index} style={[styles.xAxisLabel, { color: chartColors.text }]}>
              {shouldShowLabel(index, data.labels.length) ? label : ' '}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const PieChart = ({ data, width, height }) => {
    if (!data || data.length === 0) return null;
    
    const total = data.reduce((sum, item) => sum + item.population, 0);
    const size = Math.min(width, height) - 20;
    const radius = size / 2;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * (radius - strokeWidth / 2);

    // Convert segments to strokeDasharray offsets
    let cumulative = 0;
    const segments = data.map((seg) => {
      const value = total > 0 ? seg.population / total : 0;
      const length = circumference * value;
      const dasharray = `${length} ${circumference - length}`;
      const dashoffset = circumference * cumulative * -1; // negative to draw clockwise
      cumulative += value;
      return { ...seg, dasharray, dashoffset };
    });

    return (
      <View style={[styles.customChart, { width, height }]}>  
        <View style={styles.donutWrapper}>
          <Svg width={size} height={size}>
            {/* Track */}
            <Circle
              cx={radius}
              cy={radius}
              r={radius - strokeWidth / 2}
              stroke="#EEF2F7"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Segments */}
            {segments.map((s, i) => (
              <Circle
                key={i}
                cx={radius}
                cy={radius}
                r={radius - strokeWidth / 2}
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                originX={radius}
                originY={radius}
              />
            ))}
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotal}>{total}</Text>
            <Text style={styles.donutLabel}>Total Items</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {data.map((item, idx) => {
            const pct = total > 0 ? (item.population / total) * 100 : 0;
            return (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText} numberOfLines={1}>
                  {item.name} <Text style={styles.legendTextStrong}>({pct.toFixed(1)}%)</Text>
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

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
              {/* Sales Chart */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Sales Trend Chart</Text>
                <Text style={styles.chartSubtitle}>Daily sales for {getDateRangeText()}</Text>
                {isLoading ? (
                  <View style={styles.chartLoading}>
                    <Text style={styles.chartLoadingText}>Loading chart...</Text>
                  </View>
                ) : salesData.length > 0 ? (
                  <LineChart
                    data={salesChartData}
                    width={screenWidth - 72}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    fromZero
                  />
                ) : (
                  <View style={styles.chartNoData}>
                    <Text style={styles.chartNoDataText}>No sales data available</Text>
                    <Text style={styles.chartNoDataSubtext}>Sales will appear here once transactions are made</Text>
                  </View>
                )}
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
              {/* Inventory Chart */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Inventory Status Chart</Text>
                <Text style={styles.chartSubtitle}>Stock levels and alerts</Text>
                {inventoryItems.length > 0 ? (
                  <PieChart
                    data={inventoryChartData}
                    width={screenWidth - 72}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                ) : (
                  <View style={styles.chartNoData}>
                    <Text style={styles.chartNoDataText}>No inventory items</Text>
                    <Text style={styles.chartNoDataSubtext}>Add products to see inventory status</Text>
                  </View>
                )}
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
              {/* Transaction Chart */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Transaction Volume</Text>
                <Text style={styles.chartSubtitle}>Daily transaction count</Text>
                {isLoading ? (
                  <View style={styles.chartLoading}>
                    <Text style={styles.chartLoadingText}>Loading chart...</Text>
                  </View>
                ) : salesData.length > 0 ? (
                  <BarChart
                    data={transactionChartData}
                    width={screenWidth - 72}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero
                    showBarTops
                    showValuesOnTopOfBars
                  />
                ) : (
                  <View style={styles.chartNoData}>
                    <Text style={styles.chartNoDataText}>No transaction data available</Text>
                    <Text style={styles.chartNoDataSubtext}>Transactions will appear here once sales are made</Text>
                  </View>
                )}
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
  chartContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLoading: {
    width: screenWidth - 72,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingSpinner: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  spinnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6D28D9',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  chartLoadingText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartNoData: {
    width: screenWidth - 72,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  chartNoDataText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  chartNoDataSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
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
  // New styles for custom charts
  customChart: {
    width: screenWidth - 72,
    height: 220,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  yAxisContainer: {
    position: 'absolute',
    left: 15,
    top: 20,
    bottom: 20,
    width: 35,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  chartMainArea: {
    flex: 1,
    marginLeft: 50,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'space-between',
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  chartDataContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  chartColumn: {
    alignItems: 'center',
    width: 30,
    position: 'relative',
  },
  lineChartPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  connectingLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#6D28D9',
    borderRadius: 1,
  },
  xAxisContainer: {
    position: 'absolute',
    bottom: 15,
    left: 50,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  barChartBar: {
    width: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  pieChartVisual: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  pieChartTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  pieChartLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  pieSlicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieSliceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 3,
  },
  pieSliceVisual: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pieSliceBar: {
    borderRadius: 5,
  },
  pieSliceInfo: {
    flex: 1,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 10,
    color: '#6B7280',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 5,
    zIndex: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tooltipValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stackedBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  stackedBar: {
    width: '90%',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#EEF2F7',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stackedSegment: {
    height: '100%',
  },
  stackedBarTotal: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  legendRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '45%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
  legendTextStrong: {
    fontWeight: '700',
  },
  donutWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  donutCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  donutLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ReportsScreen;
