import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CheckoutScreen = ({ onBackToCart, cartItems, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [gcashRef, setGcashRef] = useState('');

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.12; // 12% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const getChange = () => {
    const cash = parseFloat(cashAmount) || 0;
    return cash - getTotal();
  };

  const handlePaymentComplete = () => {
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < getTotal())) {
      Alert.alert('Invalid Amount', 'Cash amount must be greater than or equal to total amount.');
      return;
    }

    if (paymentMethod === 'cash' && getChange() < 0) {
      Alert.alert('Insufficient Amount', 'Cash amount is less than total amount.');
      return;
    }

    if (paymentMethod === 'gcash' && !gcashRef.trim()) {
      Alert.alert('Missing Reference', 'Please enter the GCash reference number.');
      return;
    }

    const methodLabel = paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'GCash';

    onPaymentComplete({
      paymentMethod: methodLabel,
      amountReceived: paymentMethod === 'cash' ? cashAmount : 0,
      referenceNumber: paymentMethod === 'gcash' ? gcashRef.trim() : '',
    });
  };

  const handleBackToCart = () => {
    onBackToCart();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToCart} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Back to Cart</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Checkout</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderItems}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemTotal}>P{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>P{getSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (12%)</Text>
            <Text style={styles.summaryValue}>P{getTax().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>P{getTotal().toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('cash')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color={paymentMethod === 'cash' ? '#8B5CF6' : '#6B7280'} 
              />
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'cash' && styles.paymentOptionTextActive
              ]}>
                Cash
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('card')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={paymentMethod === 'card' ? '#8B5CF6' : '#6B7280'} 
              />
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'card' && styles.paymentOptionTextActive
              ]}>
                Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'gcash' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('gcash')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="phone-portrait-outline" 
                size={24} 
                color={paymentMethod === 'gcash' ? '#8B5CF6' : '#6B7280'} 
              />
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'gcash' && styles.paymentOptionTextActive
              ]}>
                GCash
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cash Amount Input */}
          {paymentMethod === 'cash' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cash Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter cash amount"
                value={cashAmount}
                onChangeText={setCashAmount}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              {cashAmount && parseFloat(cashAmount) >= getTotal() && (
                <View style={styles.changeContainer}>
                  <Text style={styles.changeLabel}>Change:</Text>
                  <Text style={styles.changeAmount}>P{getChange().toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}

          {/* GCash Reference Input */}
          {paymentMethod === 'gcash' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GCash Reference Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter reference number"
                value={gcashRef}
                onChangeText={setGcashRef}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>
          )}
        </View>

        {/* Complete Payment Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handlePaymentComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>Complete Payment</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerSpacer: {
    width: 100,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: 'white',
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#8B5CF6',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  paymentOptionTextActive: {
    color: '#8B5CF6',
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  completeButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;

