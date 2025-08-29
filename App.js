import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import DashboardScreen from './components/screen/DashboardScreen';
import { InventoryProvider } from './components/context/InventoryContext';
import { loginUser, logoutUser, onAuthStateChange, getCurrentUser, getAvailableUsers } from './components/services/auth';

export default function App() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const roles = ['Admin', 'Cashier'];
  const availableUsers = getAvailableUsers();

  // Check authentication state on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setSelectedRole(user.displayName || 'Admin');
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await loginUser(username.trim(), password, selectedRole);
      setCurrentUser(result.user);
      setIsLoggedIn(true);
      setPassword(''); // Clear password for security
      console.log('Login successful:', result.role);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setIsLoggedIn(false);
      setUsername('');
      setPassword('');
      setSelectedRole('Admin');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show Dashboard if logged in, otherwise show Login
  if (isLoggedIn) {
    return (
      <InventoryProvider>
        <DashboardScreen onLogout={handleLogout} selectedRole={selectedRole} currentUser={currentUser} />
      </InventoryProvider>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Main Login Card */}
      <View style={styles.loginCard}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('./assets/images/logo/logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>POS and Inventory System</Text>

        {/* Username Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter email address"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Role Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Role</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{selectedRole}</Text>
            <Ionicons 
              name={showRoleDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </TouchableOpacity>
          
          {/* Role Dropdown Options */}
          {showRoleDropdown && (
            <View style={styles.dropdownOptions}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.dropdownOption,
                    selectedRole === role && styles.dropdownOptionSelected
                  ]}
                  onPress={() => handleRoleSelect(role)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    selectedRole === role && styles.dropdownOptionTextSelected
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]} 
          activeOpacity={0.8} 
          onPress={handleLogin}
          disabled={isLoggingIn}
        >
          <Text style={styles.loginButtonText}>
            {isLoggingIn ? 'Logging in...' : 'Log in'}
          </Text>
        </TouchableOpacity>

        {/* Demo Credentials */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Admin: admin@islandtea.com / admin123</Text>
          <Text style={styles.demoText}>Cashier: cashier@islandtea.com / cashier123</Text>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginCard: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    maxWidth: 380,
    minHeight: 260,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 150,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 32,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 32,
  },
  dropdownText: {
    fontSize: 12,
    color: '#374151',
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 6,
    marginTop: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dropdownOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownOptionSelected: {
    backgroundColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 12,
    color: '#374151',
  },
  dropdownOptionTextSelected: {
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  loginButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    padding: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
    minHeight: 36,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    marginTop: 6,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  demoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});