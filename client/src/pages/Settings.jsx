import { useState } from 'react';
import { clientAPI, vehicleAPI, policyAPI } from '../services/api';
import { MdDownload, MdInfo } from 'react-icons/md';
import toast from 'react-hot-toast';

const Settings = () => {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async (type) => {
    try {
      setExporting(true);
      let data = [];
      let filename = '';
      let headers = [];

      if (type === 'clients') {
        const res = await clientAPI.getAll({ limit: 10000 });
        data = res.data.data;
        headers = ['Full Name', 'Phone', 'Email', 'Address', 'Date of Birth'];
        filename = 'clients_export.csv';
        data = data.map((d) => [
          d.fullName, d.phone, d.email || '', d.address,
          new Date(d.dateOfBirth).toLocaleDateString('en-IN'),
        ]);
      } else if (type === 'vehicles') {
        const res = await vehicleAPI.getAll({ limit: 10000 });
        data = res.data.data;
        headers = ['Vehicle Number', 'Owner', 'Make & Model', 'Year', 'Fuel Type', 'Engine/Chassis No.'];
        filename = 'vehicles_export.csv';
        data = data.map((d) => [
          d.vehicleNumber, d.clientId?.fullName || '', d.makeModel,
          d.yearOfManufacture, d.fuelType, d.engineChassisNumber,
        ]);
      } else if (type === 'policies') {
        const res = await policyAPI.getAll({ limit: 10000 });
        data = res.data.data;
        headers = ['Policy No.', 'Client', 'Vehicle', 'Insurer', 'Type', 'Start Date', 'Expiry Date', 'Premium', 'IDV', 'Agent', 'Commission', 'Status'];
        filename = 'policies_export.csv';
        data = data.map((d) => [
          d.policyNumber, d.clientId?.fullName || '', d.vehicleId?.vehicleNumber || '',
          d.insuranceCompany, d.policyType,
          new Date(d.startDate).toLocaleDateString('en-IN'),
          new Date(d.expiryDate).toLocaleDateString('en-IN'),
          d.premiumAmount, d.idv, d.agentName || '', d.commissionEarned, d.renewalStatus,
        ]);
      }

      // Build CSV string
      const csvContent = [
        headers.join(','),
        ...data.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success(`${type} exported successfully!`);
    } catch (err) {
      toast.error(`Failed to export ${type}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="settings-section">
        <h2>⚙️ Settings</h2>

        <div className="settings-card">
          <h3><MdDownload /> Export Data</h3>
          <p className="settings-desc">Download your data as CSV files for backup or analysis.</p>
          <div className="export-buttons">
            <button className="btn btn-primary" onClick={() => exportToCSV('clients')} disabled={exporting}>
              <MdDownload /> Export Clients
            </button>
            <button className="btn btn-primary" onClick={() => exportToCSV('vehicles')} disabled={exporting}>
              <MdDownload /> Export Vehicles
            </button>
            <button className="btn btn-primary" onClick={() => exportToCSV('policies')} disabled={exporting}>
              <MdDownload /> Export Policies
            </button>
          </div>
        </div>

        <div className="settings-card">
          <h3><MdInfo /> Insurance Companies</h3>
          <p className="settings-desc">The following insurance companies are available in policy forms:</p>
          <div className="company-list">
            {[
              'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'New India Assurance',
              'United India Insurance', 'Oriental Insurance', 'National Insurance',
              'Tata AIG', 'SBI General', 'Reliance General', 'Digit Insurance',
              'Acko', 'Royal Sundaram', 'Cholamandalam MS', 'Iffco Tokio', 'Other',
            ].map((c) => (
              <span key={c} className="company-chip">{c}</span>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3><MdInfo /> Application Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">App Name</span>
              <span className="info-value">InsureHub</span>
            </div>
            <div className="info-item">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Frontend</span>
              <span className="info-value">React + Vite</span>
            </div>
            <div className="info-item">
              <span className="info-label">Backend</span>
              <span className="info-value">Node.js + Express</span>
            </div>
            <div className="info-item">
              <span className="info-label">Database</span>
              <span className="info-value">MongoDB Atlas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
