import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../context/InventoryContext';

const InventoryManagementScreen = ({ onBackToDashboard, selectedRole = 'Admin' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { inventoryItems, lowStockItems, addProduct, updateProduct } = useInventory();

  const inventorySummary = useMemo(() => ({
    totalProducts: inventoryItems.length,
    totalStockValue: inventoryItems.reduce((sum, item) => sum + (item.stock * item.cost), 0),
    lowStockCount: lowStockItems.length,
  }), [inventoryItems, lowStockItems]);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProductId, setEditingProductId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStatus, setNewStatus] = useState('active');
  const [formError, setFormError] = useState('');

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === inventoryItems.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(inventoryItems.map(item => item.id));
    }
  };

  const openAddModal = () => {
    setFormError('');
    setModalMode('add');
    setEditingProductId(null);
    resetAddForm();
    setAddModalVisible(true);
  };

  const handleAddProduct = () => {
    openAddModal();
  };

  const closeAddModal = () => {
    setAddModalVisible(false);
  };

  const resetAddForm = () => {
    setNewName('');
    setNewSku('');
    setNewStock('');
    setNewPrice('');
    setNewCost('');
    setNewCategory('');
    setNewStatus('active');
    setFormError('');
  };

  const populateFormFromItem = (item) => {
    setNewName(item.name || '');
    setNewSku(item.sku || '');
    setNewStock(String(item.stock ?? ''));
    setNewPrice(String(item.price ?? ''));
    setNewCost(String(item.cost ?? ''));
    setNewCategory(item.category || '');
    setNewStatus(item.status || 'active');
  };

  const saveNewProduct = () => {
    // Basic validation
    if (!newName.trim()) return setFormError('Product name is required.');
    if (!newSku.trim()) return setFormError('SKU/Code is required.');
    const stockNum = parseInt(newStock, 10);
    if (isNaN(stockNum) || stockNum < 0) return setFormError('Stock must be a non-negative number.');
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) return setFormError('Price must be a non-negative number.');
    const costNum = parseFloat(newCost);
    if (isNaN(costNum) || costNum < 0) return setFormError('Cost must be a non-negative number.');

    if (modalMode === 'add') {
      addProduct({
        name: newName.trim(),
        sku: newSku.trim(),
        stock: stockNum,
        price: priceNum,
        cost: costNum,
        category: newCategory.trim() || 'Uncategorized',
        status: stockNum <= 10 ? 'low-stock' : newStatus,
      });
      closeAddModal();
      resetAddForm();
      return;
    }

    updateProduct(editingProductId, {
      name: newName.trim(),
      sku: newSku.trim(),
      stock: stockNum,
      price: priceNum,
      cost: costNum,
      category: newCategory.trim() || 'Uncategorized',
      status: stockNum <= 10 ? 'low-stock' : newStatus,
    });
    closeAddModal();
    resetAddForm();
  };

  const handleEditProduct = (productId) => {
    const item = inventoryItems.find(i => i.id === productId);
    if (!item) return;
    setModalMode('edit');
    setEditingProductId(productId);
    populateFormFromItem(item);
    setFormError('');
    setAddModalVisible(true);
  };

  const handleStockIn = (productId) => {
    const item = inventoryItems.find(i => i.id === productId);
    if (!item) return;
    const next = Math.max(0, (item.stock || 0) + 1);
    updateProduct(productId, { stock: next });
  };

  const handleStockOut = (productId) => {
    const item = inventoryItems.find(i => i.id === productId);
    if (!item) return;
    const next = Math.max(0, (item.stock || 0) - 1);
    updateProduct(productId, { stock: next });
  };

  const getFilteredAndSortedItems = () => {
    let filtered = inventoryItems;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.category === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return a.stock - b.stock;
        case 'price':
          return a.price - b.price;
        case 'sku':
          return a.sku.localeCompare(b.sku);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low-stock':
        return '#EF4444';
      case 'active':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low-stock':
        return 'Low Stock';
      case 'active':
        return 'Active';
      default:
        return 'Inactive';
    }
  };

  const filteredItems = getFilteredAndSortedItems();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventory Management</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addProductButton} onPress={openAddModal} activeOpacity={0.7}>
            <Text style={styles.addProductButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Controls Bar */}
          <View style={styles.controlsBar}>
            <View style={styles.controlsLeft}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Sort</Text>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>
                    {sortBy === 'name' ? 'Name' : 
                     sortBy === 'stock' ? 'Stock' : 
                     sortBy === 'price' ? 'Price' : 'SKU'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Filter</Text>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>
                    {filterBy === 'all' ? 'All Categories' : filterBy}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlsRight}>
              <TouchableOpacity 
                style={styles.selectAllButton} 
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <Text style={styles.selectAllButtonText}>
                  {selectedProducts.length === inventoryItems.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Table */}
          <View style={styles.productTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.headerCheckbox}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox, 
                    selectedProducts.length === inventoryItems.length && styles.checkboxSelected
                  ]}
                  onPress={handleSelectAll}
                >
                  {selectedProducts.length === inventoryItems.length && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.headerText}>Product Name</Text>
              <Text style={styles.headerText}>SKU/Code</Text>
              <Text style={styles.headerText}>Stock Qty</Text>
              <Text style={styles.headerText}>Price</Text>
              <Text style={styles.headerText}>Actions</Text>
            </View>

            {/* Table Rows */}
            <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
              {filteredItems.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.rowCheckbox}>
                    <TouchableOpacity 
                      style={[
                        styles.checkbox, 
                        selectedProducts.includes(item.id) && styles.checkboxSelected
                      ]}
                      onPress={() => handleProductSelection(item.id)}
                    >
                      {selectedProducts.includes(item.id) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                      <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.skuText}>{item.sku}</Text>
                  
                  <View style={styles.stockInfo}>
                    <Text style={[
                      styles.stockText, 
                      item.stock <= 10 && styles.lowStockText
                    ]}>
                      {item.stock}
                    </Text>
                  </View>
                  
                  <Text style={styles.priceText}>P{item.price.toFixed(2)}</Text>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleEditProduct(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleStockIn(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleStockOut(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove-circle-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Right Sidebar */}
        <View style={styles.sidebar}>
          {/* Low Stock Alerts */}
          <View style={styles.sidebarCard}>
            <Text style={styles.cardTitle}>Low-Stock Alerts</Text>
            {lowStockItems.map((item) => (
              <View key={item.id} style={styles.alertItem}>
                <View style={styles.alertIcon}>
                  <Ionicons name="warning" size={20} color="#EF4444" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertProductName}>{item.name}</Text>
                  <Text style={styles.alertStockText}>Low Stock</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Inventory Summary */}
          <View style={styles.sidebarCard}>
            <Text style={styles.cardTitle}>Inventory Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total products</Text>
              <Text style={styles.summaryValue}>{inventorySummary.totalProducts}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total stock value</Text>
              <Text style={styles.summaryValue}>P{inventorySummary.totalStockValue.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Low-stock items</Text>
              <Text style={styles.summaryValue}>{inventorySummary.lowStockCount}</Text>
            </View>
          </View>

          {/* Add/Edit Product Button */}
          <View style={styles.sidebarCard}>
            <TouchableOpacity style={styles.addEditButton} onPress={openAddModal} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
              <Text style={styles.addEditButtonText}>Add/Edit Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Add/Edit Product Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</Text>

            {!!formError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Product Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Brown Sugar Milk Tea"
                value={newName}
                onChangeText={setNewName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>SKU/Code</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. BS001"
                value={newSku}
                onChangeText={setNewSku}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Stock</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  value={newStock}
                  onChangeText={setNewStock}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Price</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Cost</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  value={newCost}
                  onChangeText={setNewCost}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Category</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Milk Tea"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { closeAddModal(); }} activeOpacity={0.7}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveNewProduct} activeOpacity={0.8}>
                <Text style={styles.modalButtonTextSave}>{modalMode === 'add' ? 'Save Product' : 'Update Product'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minWidth: 200,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
  },
  addProductButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  dropdownContainer: {
    alignItems: 'center',
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 8,
    minWidth: 100,
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  controlsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  selectAllButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectAllButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  productTable: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCheckbox: {
    width: 40,
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  rowCheckbox: {
    width: 40,
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  productInfo: {
    flex: 1,
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  skuText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  stockInfo: {
    flex: 1,
    alignItems: 'center',
  },
  stockText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  lowStockText: {
    color: '#EF4444',
  },
  priceText: {
    flex: 1,
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebar: {
    width: 280,
    padding: 24,
    gap: 20,
  },
  sidebarCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertProductName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  alertStockText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  addEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  addEditButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: 'white',
  },
  rowFields: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  modalButtonTextCancel: {
    color: '#374151',
    fontWeight: '600',
  },
  modalButtonTextSave: {
    color: 'white',
    fontWeight: '700',
  },
});

export default InventoryManagementScreen;



