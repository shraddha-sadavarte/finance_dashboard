//This provides global auth state — who is logged in, their role, login and logout functions
// — accessible from any component in the app.

import { createContext, useState, useEffect } from 'react';
import { loginApi } from '../api/auth.api.js';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — restore session from localStorage 
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login 
  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const { token: newToken, user: newUser } = response.data;

      // Save to state
      setToken(newToken);
      setUser(newUser);

      // Persist in localStorage so session survives page refresh
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      toast.success(`Welcome back, ${newUser.name}!`);
      return { success: true, role: newUser.role };

    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false };
    }
  };

  // Logout 
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  //Helper flags 
  const isAdmin   = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST';
  const isViewer  = user?.role === 'VIEWER';

  const value = { user, token, loading, login, logout, isAdmin, isAnalyst, isViewer, isAuthenticated: !!token,};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};