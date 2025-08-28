import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionReceiptScreen = ({ 
  cartItems = [], 
  paymentMethod = 'Cash', 
  amountReceived = 0, 
  discount = 0, 
  referenceNumber = '',
  onPrintReceipt, 
  onStartNewSale, 
  onViewTransactionHistory 
}) => {
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return 0; // Tax is 0 for this example
  };

  const getGrandTotal = () => {
    const subtotal = getSubtotal();
    const discountAmount = parseFloat(discount) || 0;
    const tax = getTax();
    return subtotal - discountAmount + tax;
  };

  const getChange = () => {
    if (paymentMethod === 'Cash') {
      const received = parseFloat(amountReceived) || 0;
      const total = getGrandTotal();
      return received - total;
    }
    return 0; // No change for digital payments
  };

  const generateTransactionNumber = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit number
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    
    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {/* Success Icon and Message */}
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#6B7280" />
          </View>
          <Text style={styles.successText}>Payment Successful!</Text>
        </View>

        <View style={styles.divider} />

        {/* Receipt Summary */}
        <View style={styles.receiptSection}>
          <Text style={styles.receiptTitle}>Receipt Summary</Text>
          
          <View style={styles.divider} />
          
          {/* Transaction Info */}
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionNumber}>Transaction #{generateTransactionNumber()}</Text>
            <Text style={styles.transactionDateTime}>{getCurrentDateTime()}</Text>
          </View>

          {/* Items List */}
          <View style={styles.itemsList}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantity} x P{item.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Details */}
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Paid</Text>
              <Text style={styles.paymentValue}>{paymentMethod}</Text>
            </View>
            {paymentMethod === 'Cash' && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Change</Text>
                <Text style={styles.paymentValue}>P{getChange().toFixed(2)}</Text>
              </View>
            )}
            {referenceNumber && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Reference #</Text>
                <Text style={styles.paymentValue}>{referenceNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.topRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onPrintReceipt}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Print Receipt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onStartNewSale}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Start New Sale</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.fullWidthButton} 
            onPress={onViewTransactionHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>View Transaction History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8', // Very light pink background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#F3F4F6', // Light gray card
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 16,
  },
  receiptSection: {
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  transactionInfo: {
    marginBottom: 16,
  },
  transactionNumber: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDateTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemsList: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  paymentDetails: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  fullWidthButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
});

export default TransactionReceiptScreen;
