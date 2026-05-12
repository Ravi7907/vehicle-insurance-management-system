import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MdDashboard,
  MdPeople,
  MdDirectionsCar,
  MdPolicy,
  MdBarChart,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
  MdLogout,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: MdDashboard, label: 'Dashboard' },
  { path: '/clients', icon: MdPeople, label: 'Clients' },
  { path: '/vehicles', icon: MdDirectionsCar, label: 'Vehicles' },
  { path: '/policies', icon: MdPolicy, label: 'Policies' },
  { path: '/reports', icon: MdBarChart, label: 'Reports' },
  { path: '/settings', icon: MdSettings, label: 'Settings' },
];

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useApp();
  const { logout } = useAuth();

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        {sidebarOpen && (
          <div className="sidebar-logo">
            <MdPolicy className="logo-icon" />
            <span>PolicyCraft</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {sidebarOpen ? <MdChevronLeft /> : <MdChevronRight />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon className="nav-icon" />
            {sidebarOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}

        <button
          className="nav-item logout-btn"
          onClick={logout}
          title="Logout"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
        >
          <MdLogout className="nav-icon" />
          {sidebarOpen && <span className="nav-label">Logout</span>}
        </button>
      </nav>

      {sidebarOpen && (
        <div className="sidebar-footer">
          <p>PolicyCraft</p>
          <small>v1.0.0</small>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
