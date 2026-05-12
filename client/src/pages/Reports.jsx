import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const [monthly, setMonthly] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [agents, setAgents] = useState([]);
  const [renewalStatus, setRenewalStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [monthlyRes, companyRes, agentRes, statusRes] = await Promise.all([
          dashboardAPI.getMonthlyReport(year),
          dashboardAPI.getCompanyReport(),
          dashboardAPI.getAgentReport(),
          dashboardAPI.getRenewalStatus(),
        ]);
        setMonthly(monthlyRes.data.data);
        setCompanies(companyRes.data.data);
        setAgents(agentRes.data.data);
        setRenewalStatus(statusRes.data.data);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  const chartColors = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
    '#a855f7', '#22d3ee', '#84cc16', '#e11d48', '#0ea5e9',
  ];

  const monthlyChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Renewals',
        data: monthly.map((m) => m.count),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Premium (₹K)',
        data: monthly.map((m) => m.totalPremium / 1000),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const companyChartData = {
    labels: companies.map((c) => c._id),
    datasets: [{
      data: companies.map((c) => c.totalPremium),
      backgroundColor: chartColors.slice(0, companies.length),
      borderWidth: 2,
      borderColor: '#1a1a2e',
    }],
  };

  const statusChartData = {
    labels: renewalStatus.map((s) => s._id),
    datasets: [{
      data: renewalStatus.map((s) => s.count),
      backgroundColor: [
        '#10b981', // Active - green
        '#f59e0b', // Pending - yellow
        '#6366f1', // Done - purple
        '#ef4444', // Expired - red
      ],
      borderWidth: 2,
      borderColor: '#1a1a2e',
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#a0aec0', font: { family: "'Inter', sans-serif" } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#a0aec0' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#a0aec0' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#a0aec0', font: { family: "'Inter', sans-serif" }, padding: 15 },
      },
    },
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📊 Reports & Analytics</h2>
        <div className="year-selector">
          <button className="btn btn-outline btn-sm" onClick={() => setYear(year - 1)}>← {year - 1}</button>
          <span className="year-label">{year}</span>
          <button className="btn btn-outline btn-sm" onClick={() => setYear(year + 1)}>{year + 1} →</button>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card wide">
          <h3>Monthly Renewals & Premium ({year})</h3>
          <div className="chart-wrapper">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Premium by Insurance Company</h3>
          <div className="chart-wrapper">
            <Doughnut data={companyChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Renewal Status Distribution</h3>
          <div className="chart-wrapper">
            <Pie data={statusChartData} options={doughnutOptions} />
          </div>
        </div>

        {agents.length > 0 && (
          <div className="chart-card wide">
            <h3>Agent Performance</h3>
            <div className="agent-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Policies Sold</th>
                    <th>Total Premium</th>
                    <th>Commission Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a, i) => (
                    <tr key={i}>
                      <td>{a._id}</td>
                      <td>{a.policiesSold}</td>
                      <td>₹{a.totalPremium?.toLocaleString('en-IN')}</td>
                      <td>₹{a.totalCommission?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
