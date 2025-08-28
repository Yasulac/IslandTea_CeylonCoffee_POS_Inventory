import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CheckoutScreen from './CheckoutScreen';
import TransactionReceiptScreen from './TransactionReceiptScreen';
import { useInventory } from '../context/InventoryContext';

const POSSaleScreen = ({ onBackToDashboard, selectedRole = 'Cashier' }) => {
  const [currentScreen, setCurrentScreen] = useState('pos-sale');
  const [cartItems, setCartItems] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { inventoryItems, adjustStockById } = useInventory();

  const categories = useMemo(() => Array.from(new Set(inventoryItems.map(i => i.category))), [inventoryItems]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const products = useMemo(() => (
    inventoryItems.map(i => ({ id: i.id, name: i.name, price: Number(i.price) || 0, category: i.category, image: null, stock: i.stock }))
  ), [inventoryItems]);

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.name === product.name);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.name === product.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1 
      }]);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setCurrentScreen('checkout');
  };

  const handleBackToCart = () => {
    setCurrentScreen('pos-sale');
  };

  const handlePaymentComplete = (details) => {
    cartItems.forEach(item => {
      adjustStockById(item.id, -item.quantity);
    });
    setPaymentDetails(details || null);
    setCurrentScreen('receipt');
  };

  const handleCancelSale = () => {
    setCartItems([]);
  };

  const handleHoldOrder = () => {
    // Handle hold order logic here
    console.log('Holding order:', cartItems);
  };

  // Show Checkout Screen if currentScreen is 'checkout'
  if (currentScreen === 'checkout') {
    return (
      <CheckoutScreen 
        onBackToCart={handleBackToCart}
        cartItems={cartItems}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  // Show Transaction Receipt Screen after successful payment
  if (currentScreen === 'receipt') {
    return (
      <TransactionReceiptScreen
        cartItems={cartItems}
        paymentMethod={paymentDetails?.paymentMethod || 'Cash'}
        amountReceived={paymentDetails?.amountReceived || 0}
        referenceNumber={paymentDetails?.referenceNumber || ''}
        onPrintReceipt={() => {}}
        onStartNewSale={() => {
          setCartItems([]);
          setPaymentDetails(null);
          setCurrentScreen('pos-sale');
        }}
        onViewTransactionHistory={onBackToDashboard}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
        
        <Text style={styles.cashierName}>{selectedRole} John</Text>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Cashier time</Text>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>0:12</Text>
            <TouchableOpacity style={styles.minusButton}>
              <Ionicons name="remove" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Left Section - Product Selection */}
        <View style={styles.leftSection}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.categoriesLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products Grid */}
          <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.productsGrid}>
              {products
                .filter(product => !selectedCategory || product.category === selectedCategory)
                .map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => addToCart(product)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#D1D5DB" />
                    </View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>P{product.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>

        {/* Right Section - Shopping Cart */}
        <View style={styles.rightSection}>
          <Text style={styles.cartTitle}>Items in Cart</Text>
          
          {/* Cart Items */}
          <ScrollView style={styles.cartItemsContainer} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>P{item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Subtotal */}
          <View style={styles.subtotalContainer}>
            <View style={styles.subtotalLine} />
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalAmount}>P{getSubtotal().toFixed(2)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.checkoutButton, cartItems.length === 0 && styles.checkoutButtonDisabled]} 
              onPress={handleCheckout} 
              activeOpacity={0.8}
              disabled={cartItems.length === 0}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleCancelSale} activeOpacity={0.7}>
                <Text style={styles.secondaryButtonText}>Cancel Sale</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleHoldOrder} activeOpacity={0.7}>
                <Text style={styles.secondaryButtonText}>Hold Order</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  cashierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  minusButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    flex: 2,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  rightSection: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  cartItemsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    width: 32,
    height: 28,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  subtotalContainer: {
    marginBottom: 20,
  },
  subtotalLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  subtotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  actionButtons: {
    gap: 15,
  },
  checkoutButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 15,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default POSSaleScreen;
