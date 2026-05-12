import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { MdArrowBack, MdPerson, MdPhone, MdEmail, MdHome, MdCake } from 'react-icons/md';
import toast from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const res = await clientAPI.getById(id);
        setClient(res.data.data);
      } catch (err) {
        toast.error('Failed to load client details');
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!client) return null;

  const vehicleColumns = [
    { key: 'vehicleNumber', label: 'Reg. Number' },
    { key: 'makeModel', label: 'Make & Model' },
    { key: 'yearOfManufacture', label: 'Year' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'engineChassisNumber', label: 'Engine/Chassis No.' },
  ];

  const policyColumns = [
    { key: 'policyNumber', label: 'Policy No.' },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (row) => row.vehicleId?.vehicleNumber || 'N/A',
    },
    { key: 'insuranceCompany', label: 'Insurer' },
    { key: 'policyType', label: 'Type' },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (row) => new Date(row.expiryDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'premiumAmount',
      label: 'Premium',
      render: (row) => `₹${row.premiumAmount?.toLocaleString('en-IN')}`,
    },
    {
      key: 'renewalStatus',
      label: 'Status',
      render: (row) => (
        <span className={`status-badge status-${row.renewalStatus?.toLowerCase()}`}>
          {row.renewalStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="page-content">
      <button className="btn btn-outline back-btn" onClick={() => navigate('/clients')}>
        <MdArrowBack /> Back to Clients
      </button>

      <div className="client-detail-card">
        <div className="detail-header">
          <div className="detail-avatar">
            <MdPerson />
          </div>
          <div>
            <h2>{client.fullName}</h2>
            <p className="detail-subtitle">Client Details</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <MdPhone className="detail-icon" />
            <div>
              <span className="detail-label">Phone</span>
              <span className="detail-value">{client.phone}</span>
            </div>
          </div>
          <div className="detail-item">
            <MdEmail className="detail-icon" />
            <div>
              <span className="detail-label">Email</span>
              <span className="detail-value">{client.email || 'Not provided'}</span>
            </div>
          </div>
          <div className="detail-item">
            <MdHome className="detail-icon" />
            <div>
              <span className="detail-label">Address</span>
              <span className="detail-value">{client.address}</span>
            </div>
          </div>
          <div className="detail-item">
            <MdCake className="detail-icon" />
            <div>
              <span className="detail-label">Date of Birth</span>
              <span className="detail-value">{new Date(client.dateOfBirth).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>🚗 Vehicles ({client.vehicles?.length || 0})</h2>
        <DataTable
          columns={vehicleColumns}
          data={client.vehicles || []}
          emptyMessage="No vehicles registered for this client"
        />
      </div>

      <div className="dashboard-section">
        <h2>📄 Policies ({client.policies?.length || 0})</h2>
        <DataTable
          columns={policyColumns}
          data={client.policies || []}
          emptyMessage="No policies found for this client"
        />
      </div>
    </div>
  );
};

export default ClientDetail;
