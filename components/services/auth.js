import { auth } from '../../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

// User roles mapping
const USER_ROLES = {
  'admin@islandtea.com': 'Admin',
  'cashier@islandtea.com': 'Cashier',
  'admin2@islandtea.com': 'Admin',
  'cashier2@islandtea.com': 'Cashier',
};

// Default passwords for demo (in production, use proper user management)
const DEFAULT_PASSWORDS = {
  'admin@islandtea.com': 'admin123',
  'cashier@islandtea.com': 'cashier123',
  'admin2@islandtea.com': 'admin456',
  'cashier2@islandtea.com': 'cashier456',
};

export const loginUser = async (email, password, selectedRole) => {
  try {
    console.log('Attempting login for:', email, 'Role:', selectedRole);
    
    // Validate email format
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    // Check if user exists in our role mapping
    const expectedRole = USER_ROLES[email];
    if (!expectedRole) {
      throw new Error('User not found. Please contact administrator.');
    }
    
    // Validate role selection matches expected role
    if (expectedRole !== selectedRole) {
      throw new Error(`Invalid role selection. This email is registered as ${expectedRole}`);
    }
    
    // Check password (in production, this would be handled by Firebase Auth)
    const expectedPassword = DEFAULT_PASSWORDS[email];
    if (password !== expectedPassword) {
      throw new Error('Invalid password. Please try again.');
    }
    
    // Attempt Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store role in user profile
    await updateProfile(user, {
      displayName: selectedRole
    });
    
    console.log('Login successful:', user.email, 'Role:', selectedRole);
    return {
      user,
      role: selectedRole,
      email: user.email
    };
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please contact administrator.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Invalid password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Logout failed. Please try again.');
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get available users for demo
export const getAvailableUsers = () => {
  return Object.keys(USER_ROLES).map(email => ({
    email,
    role: USER_ROLES[email]
  }));
};

// Validate user permissions
export const hasPermission = (userRole, requiredRole) => {
  if (requiredRole === 'Admin') {
    return userRole === 'Admin';
  }
  return true; // Cashier can access cashier features
};
