import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ onBackToDashboard, onLogout, selectedRole = 'Admin', currentUser }) => {
  const [fullName, setFullName] = useState(currentUser?.displayName || selectedRole);
  const [usernameOrEmail, setUsernameOrEmail] = useState(currentUser?.email || '');
  const [status, setStatus] = useState('Active');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');

  const handleSaveProfile = () => {
    // In a real app this would call an API. For now, provide optimistic feedback.
    setMessage('Profile updated successfully.');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setTimeout(() => setMessage(''), 2500);
      return;
    }
    if (!currentPassword) {
      setMessage('Please enter your current password.');
      setTimeout(() => setMessage(''), 2500);
      return;
    }
    setMessage('Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 90 }} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* User info panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>User Information</Text>
          <View style={styles.userRow}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={34} color="#9CA3AF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.inlinePills}>
                <View style={[styles.pill, { backgroundColor: '#F3F4F6' }]}> 
                  <Text style={styles.pillText}>{selectedRole}</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}> 
                  <Text style={[styles.pillText, { color: '#065F46' }]}>{status}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Username or Email</Text>
              <TextInput style={styles.input} value={usernameOrEmail} onChangeText={setUsernameOrEmail} placeholder="Email or username" placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Change password panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Change Password</Text>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Current password" placeholderTextColor="#9CA3AF" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="New password" placeholderTextColor="#9CA3AF" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm new password" placeholderTextColor="#9CA3AF" />
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!!message && (
        <View style={styles.toast}> 
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}
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

  body: { flex: 1, flexDirection: 'row', padding: 16, gap: 16 },
  panel: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  panelTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },

  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarPlaceholder: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  inlinePills: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB' },
  pillText: { fontSize: 12, color: '#374151', fontWeight: '700' },

  formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#374151', backgroundColor: 'white' },

  primaryButton: { backgroundColor: '#8B5CF6', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  primaryButtonText: { color: 'white', fontWeight: '700' },

  logoutButton: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#EF4444', fontWeight: '700' },

  toast: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  toastText: { color: 'white', fontWeight: '600' },
});

export default ProfileScreen;


