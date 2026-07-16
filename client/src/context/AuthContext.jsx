import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ss_token'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      api.get('/api/auth/me').then(res => setUser(res.data)).catch(() => logout()).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [token]);
  const login = (tokenVal, userData) => {
    localStorage.setItem('ss_token', tokenVal);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + tokenVal;
    setToken(tokenVal); setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('ss_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };
  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
