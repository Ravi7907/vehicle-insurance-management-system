import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  MdPeople,
  MdDirectionsCar,
  MdPolicy,
  MdAttachMoney,
  MdWarning,
  MdTrendingUp,
} from 'react-icons/md';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, fetchStats, fetchRenewalCount } = useApp();
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await fetchStats();
        await fetchRenewalCount();
        const res = await dashboardAPI.getRenewals();
        setRenewals(res.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [fetchStats, fetchRenewalCount]);

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const renewalColumns = [
    {
      key: 'client',
      label: 'Client',
      render: (row) => row.clientId?.fullName || 'N/A',
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (row) => row.vehicleId?.vehicleNumber || 'N/A',
    },
    {
      key: 'policyNumber',
      label: 'Policy No.',
    },
    {
      key: 'insuranceCompany',
      label: 'Insurer',
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (row) => new Date(row.expiryDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'daysLeft',
      label: 'Days Left',
      render: (row) => {
        const days = getDaysUntilExpiry(row.expiryDate);
        return (
          <span className={`days-badge ${days <= 7 ? 'critical' : days <= 15 ? 'warning' : 'ok'}`}>
            {days} days
          </span>
        );
      },
    },
    {
      key: 'premiumAmount',
      label: 'Premium',
      render: (row) => `₹${row.premiumAmount?.toLocaleString('en-IN')}`,
    },
  ];

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatCard icon={MdPeople} label="Total Clients" value={stats?.totalClients || 0} color="#6366f1" />
        <StatCard icon={MdDirectionsCar} label="Total Vehicles" value={stats?.totalVehicles || 0} color="#06b6d4" />
        <StatCard icon={MdPolicy} label="Total Policies" value={stats?.totalPolicies || 0} color="#8b5cf6" />
        <StatCard icon={MdAttachMoney} label="Total Premium" value={formatCurrency(stats?.totalPremium || 0)} color="#10b981" />
        <StatCard icon={MdWarning} label="Expiring Soon" value={stats?.expiringPolicies || 0} color="#ef4444" />
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>🔔 Upcoming Renewals (Next 30 Days)</h2>
          <button className="btn btn-outline" onClick={() => navigate('/policies?status=Pending')}>
            View All
          </button>
        </div>
        <DataTable
          columns={renewalColumns}
          data={renewals}
          emptyMessage="🎉 No policies expiring in the next 30 days!"
        />
      </div>
    </div>
  );
};

export default Dashboard;
