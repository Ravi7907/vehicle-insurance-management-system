import { createContext, useContext, useState, useCallback } from 'react';
import { dashboardAPI } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renewalCount, setRenewalCount] = useState(0);
  const [stats, setStats] = useState(null);

  const fetchRenewalCount = useCallback(async () => {
    try {
      const res = await dashboardAPI.getRenewals();
      setRenewalCount(res.data.data.length);
    } catch (err) {
      console.error('Failed to fetch renewal count:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        renewalCount,
        fetchRenewalCount,
        stats,
        fetchStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
