import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Authentication utilities
export const auth = {
  // Store JWT token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Get JWT token
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Remove JWT token
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔐 No token found');
      return false;
    }
    
    // Check if token is expired
    if (auth.isTokenExpired(token)) {
      console.log('🔐 Token is expired, removing...');
      auth.removeToken();
      return false;
    }
    
    console.log('🔐 User is authenticated');
    return true;
  },

  // Store user data
  setUserData: (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Get username (email) from stored user data
  getUsername: () => {
    const userData = auth.getUserData();
    return userData?.username || userData?.email || null;
  },

  // Get user's display name (full name or fallback to username)
  getDisplayName: () => {
    const userData = auth.getUserData();
    return userData?.name || userData?.fullName || userData?.username || userData?.email || 'User';
  },

  // Validate token format (basic JWT validation)
  isValidTokenFormat: (token) => {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
  },

  // Check if token is expired (client-side check)
  isTokenExpired: (token = null) => {
    const tokenToCheck = token || auth.getToken();
    if (!tokenToCheck || !auth.isValidTokenFormat(tokenToCheck)) return true;
    
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  // Complete logout
  logout: () => {
    auth.removeToken();
    window.location.href = '/login';
  },

  // Login with token and user data
  login: (token, userData) => {
    console.log('🔐 Logging in with token:', token ? 'Token received' : 'No token');
    auth.setToken(token);
    auth.setUserData(userData);
    console.log('✅ Login successful, token stored');
  },

  // Force refresh of authentication
  refreshAuth: () => {
    console.log('🔄 Refreshing authentication...');
    const token = auth.getToken();
    if (!token || auth.isTokenExpired(token)) {
      console.log('❌ No valid token, forcing logout');
      auth.logout();
      return false;
    }
    console.log('✅ Authentication still valid');
    return true;
  },

  // Validate current authentication state
  validateAuth: () => {
    const token = auth.getToken();
    const isValid = token && auth.isValidTokenFormat(token) && !auth.isTokenExpired(token);
    
    if (!isValid && token) {
      console.log('🔐 Invalid authentication detected, clearing...');
      auth.removeToken();
    }
    
    return isValid;
  },
};