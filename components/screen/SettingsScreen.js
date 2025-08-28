import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ onBackToDashboard, selectedRole = 'Admin' }) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'preferences'

  // User management mock data
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Mendoza', role: 'Admin', email: 'alice@example.com', status: 'Active' },
    { id: 2, name: 'Ben Cruz', role: 'Cashier', email: 'ben@example.com', status: 'Inactive' },
    { id: 3, name: 'Cara Dela Cruz', role: 'Cashier', email: 'cara@example.com', status: 'Active' },
  ]);

  const [fullName, setFullName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [status, setStatus] = useState('Active');

  // App preferences
  const [currencyFormat, setCurrencyFormat] = useState('PHP');
  const [defaultTaxRate, setDefaultTaxRate] = useState('12');
  const [gatewayCash, setGatewayCash] = useState(true);
  const [gatewayGcash, setGatewayGcash] = useState(true);
  const [gatewayMaya, setGatewayMaya] = useState(false);
  const [gatewayCard, setGatewayCard] = useState(true);

  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifOutOfStock, setNotifOutOfStock] = useState(true);
  const [notifLargeTxn, setNotifLargeTxn] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const resetUserForm = () => {
    setFullName('');
    setUsernameOrEmail('');
    setPassword('');
    setRole('Admin');
    setStatus('Active');
  };

  const handleSaveUser = () => {
    if (!fullName.trim() || !usernameOrEmail.trim()) return;
    const newUser = {
      id: Date.now(),
      name: fullName.trim(),
      role,
      email: usernameOrEmail.trim(),
      status,
    };
    setUsers(prev => [newUser, ...prev]);
    resetUserForm();
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  const UserRow = ({ u }) => (
    <View style={styles.userRow}>
      <Text style={[styles.cell, { flex: 1.4 }]} numberOfLines={1}>{u.name}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{u.role}</Text>
      <Text style={[styles.cell, { flex: 1.4 }]} numberOfLines={1}>{u.email}</Text>
      <View style={[styles.cell, { flex: 0.8, alignItems: 'flex-end' }]}>
        <TouchableOpacity style={[styles.statusPill, u.status === 'Active' ? styles.statusActive : styles.statusInactive]} onPress={() => toggleUserStatus(u.id)} activeOpacity={0.7}>
          <Text style={styles.statusText}>{u.status}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 90 }} />
      </View>

      <View style={styles.body}>
        {/* Left rail */}
        <View style={styles.leftRail}>
          <TouchableOpacity style={[styles.railItem, activeTab === 'users' && styles.railItemActive]} onPress={() => setActiveTab('users')} activeOpacity={0.7}>
            <Text style={[styles.railText, activeTab === 'users' && styles.railTextActive]}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.railItem, activeTab === 'preferences' && styles.railItemActive]} onPress={() => setActiveTab('preferences')} activeOpacity={0.7}>
            <Text style={[styles.railText, activeTab === 'preferences' && styles.railTextActive]}>App Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          {activeTab === 'users' ? (
            <View>
              <Text style={styles.sectionTitle}>User Management</Text>

              {/* List */}
              <View style={styles.card}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 1.4 }]}>Name</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Role</Text>
                  <Text style={[styles.th, { flex: 1.4 }]}>Email/Username</Text>
                  <Text style={[styles.th, { flex: 0.8, textAlign: 'right' }]}>Status</Text>
                </View>
                {users.map((u) => (
                  <UserRow key={u.id} u={u} />
                ))}
              </View>

              {/* Add user */}
              <View style={styles.card}>
                <Text style={styles.subTitle}>Add New User</Text>
                <View style={styles.formRow}> 
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Username or Email</Text>
                    <TextInput style={styles.input} placeholder="Email or username" value={usernameOrEmail} onChangeText={setUsernameOrEmail} placeholderTextColor="#9CA3AF" />
                  </View>
                </View>
                <View style={styles.formRow}> 
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} placeholderTextColor="#9CA3AF" secureTextEntry />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Role</Text>
                    <TextInput style={styles.input} value={role} onChangeText={setRole} placeholderTextColor="#9CA3AF" />
                  </View>
                </View>
                <View style={styles.formRow}> 
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Status</Text>
                    <TextInput style={styles.input} value={status} onChangeText={setStatus} placeholderTextColor="#9CA3AF" />
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSaveUser} activeOpacity={0.8}>
                  <Text style={styles.primaryButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>App Preferences</Text>

              {/* Currency and Tax */}
              <View style={styles.card}>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Currency Format</Text>
                    <TextInput style={styles.input} placeholder="e.g. PHP, USD" value={currencyFormat} onChangeText={setCurrencyFormat} placeholderTextColor="#9CA3AF" />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Default Tax Rate (%)</Text>
                    <TextInput style={styles.input} placeholder="12" keyboardType="decimal-pad" value={defaultTaxRate} onChangeText={setDefaultTaxRate} placeholderTextColor="#9CA3AF" />
                  </View>
                </View>

                <Text style={[styles.label, { marginTop: 4 }]}>Payment Gateways</Text>
                <View style={styles.gatewayRow}>
                  <TouchableOpacity style={[styles.gatewayPill, gatewayCash && styles.gatewayPillActive]} onPress={() => setGatewayCash(!gatewayCash)} activeOpacity={0.7}><Text style={[styles.gatewayText, gatewayCash && styles.gatewayTextActive]}>Cash</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.gatewayPill, gatewayGcash && styles.gatewayPillActive]} onPress={() => setGatewayGcash(!gatewayGcash)} activeOpacity={0.7}><Text style={[styles.gatewayText, gatewayGcash && styles.gatewayTextActive]}>GCash</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.gatewayPill, gatewayMaya && styles.gatewayPillActive]} onPress={() => setGatewayMaya(!gatewayMaya)} activeOpacity={0.7}><Text style={[styles.gatewayText, gatewayMaya && styles.gatewayTextActive]}>Maya</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.gatewayPill, gatewayCard && styles.gatewayPillActive]} onPress={() => setGatewayCard(!gatewayCard)} activeOpacity={0.7}><Text style={[styles.gatewayText, gatewayCard && styles.gatewayTextActive]}>Card</Text></TouchableOpacity>
                </View>
              </View>

              {/* Notifications */}
              <View style={styles.card}>
                <Text style={styles.subTitle}>Notification Preferences</Text>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Low-Stock Alert Threshold</Text>
                    <TextInput style={styles.input} keyboardType="number-pad" value={lowStockThreshold} onChangeText={setLowStockThreshold} placeholderTextColor="#9CA3AF" />
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Notification Method</Text>
                      <Switch value={notifEnabled} onValueChange={setNotifEnabled} />
                    </View>
                  </View>
                </View>

                <View style={styles.checkboxGroup}>
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setNotifLowStock(!notifLowStock)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, notifLowStock && styles.checkboxChecked]}>{notifLowStock && <Ionicons name="checkmark" size={14} color="white" />}</View>
                    <Text style={styles.checkboxLabel}>Low stock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setNotifOutOfStock(!notifOutOfStock)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, notifOutOfStock && styles.checkboxChecked]}>{notifOutOfStock && <Ionicons name="checkmark" size={14} color="white" />}</View>
                    <Text style={styles.checkboxLabel}>Out-of-stock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setNotifLargeTxn(!notifLargeTxn)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, notifLargeTxn && styles.checkboxChecked]}>{notifLargeTxn && <Ionicons name="checkmark" size={14} color="white" />}</View>
                    <Text style={styles.checkboxLabel}>Large transactions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
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
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButtonText: { color: '#374151', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#374151' },

  body: { flex: 1, flexDirection: 'row' },
  leftRail: { width: 220, backgroundColor: 'white', borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingVertical: 12 },
  railItem: { paddingVertical: 12, paddingHorizontal: 20 },
  railItemActive: { backgroundColor: '#F3F4F6' },
  railText: { color: '#6B7280', fontWeight: '600' },
  railTextActive: { color: '#8B5CF6' },

  main: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 12 },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },

  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 6 },
  th: { fontSize: 12, color: '#374151', fontWeight: '700' },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  cell: { fontSize: 13, color: '#374151' },
  statusPill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  statusActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  statusInactive: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#374151' },

  formRow: { flexDirection: 'row', gap: 0, marginBottom: 12 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#374151', backgroundColor: 'white' },
  primaryButton: { backgroundColor: '#8B5CF6', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  primaryButtonText: { color: 'white', fontWeight: '700' },

  gatewayRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  gatewayPill: { borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  gatewayPillActive: { borderColor: '#8B5CF6', backgroundColor: '#EDE9FE' },
  gatewayText: { color: '#6B7280', fontWeight: '600', fontSize: 12 },
  gatewayTextActive: { color: '#6D28D9' },

  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { color: '#374151', fontWeight: '600' },

  checkboxGroup: { marginTop: 8, gap: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  checkboxLabel: { color: '#374151', fontSize: 13, fontWeight: '600' },
});

export default SettingsScreen;
