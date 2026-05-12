import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MdNotifications, MdMenu, MdLogout } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/vehicles': 'Vehicles',
  '/policies': 'Policies',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const Header = () => {
  const location = useLocation();
  const { renewalCount, fetchRenewalCount, toggleSidebar } = useApp();
  const { logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  // Determine page title — handle dynamic routes like /clients/:id
  const getTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith('/clients/')) return 'Client Details';
    return 'POLICYCRAFT';
  };

  useEffect(() => {
    fetchRenewalCount();
  }, [fetchRenewalCount]);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Menu">
          <MdMenu />
        </button>
        <h1 className="page-title">{getTitle()}</h1>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Notifications"
          >
            <MdNotifications />
            {renewalCount > 0 && (
              <span className="notification-badge">{renewalCount}</span>
            )}
          </button>

          {showNotif && (
            <div className="notification-dropdown">
              <div className="notif-header">
                <h3>Renewal Alerts</h3>
              </div>
              <div className="notif-body">
                {renewalCount > 0 ? (
                  <p className="notif-message">
                    ⚠️ <strong>{renewalCount}</strong> {renewalCount === 1 ? 'policy' : 'policies'} expiring in the next 30 days!
                  </p>
                ) : (
                  <p className="notif-message success">✅ No upcoming renewals</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={logout} 
          title="Logout" 
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            padding: '8px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MdLogout style={{ fontSize: '1.2rem' }} />
        </button>
      </div>
    </header>
  );
};

export default Header;
