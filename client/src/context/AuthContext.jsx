import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    // ✅ Safety timeout: If the server is slow, don't stay on a blank screen forever
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        clearTimeout(safetyTimeout);
        return;
      }

      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setUser(res.data.data);
        setToken(savedToken);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    verifyToken();
    return () => clearTimeout(safetyTimeout);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: newToken, ...userData } = res.data.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);

    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
