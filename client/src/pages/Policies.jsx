import { useEffect, useState } from 'react';
import { policyAPI, clientAPI, vehicleAPI } from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { MdAdd, MdEdit, MdDelete, MdFilterList } from 'react-icons/md';
import toast from 'react-hot-toast';

const policyTypes = ['Comprehensive', 'Third-Party', 'Own Damage'];
const renewalStatuses = ['Active', 'Pending', 'Done', 'Expired'];
const insuranceCompanies = [
  'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'New India Assurance',
  'United India Insurance', 'Oriental Insurance', 'National Insurance',
  'Tata AIG', 'SBI General', 'Reliance General', 'Digit Insurance',
  'Acko', 'Royal Sundaram', 'Cholamandalam MS', 'Iffco Tokio', 'Other',
];

const initialForm = {
  vehicleId: '',
  clientId: '',
  policyNumber: '',
  insuranceCompany: '',
  policyType: 'Comprehensive',
  startDate: '',
  expiryDate: '',
  premiumAmount: '',
  idv: '',
  agentName: '',
  renewalStatus: 'Active',
};

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ renewalStatus: '', policyType: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const fetchPolicies = async (searchTerm = '', filterParams = {}) => {
    try {
      setLoading(true);
      const res = await policyAPI.getAll({ search: searchTerm, ...filterParams, limit: 100 });
      setPolicies(res.data.data);
    } catch (err) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [clientRes, vehicleRes] = await Promise.all([
        clientAPI.getAll({ limit: 500 }),
        vehicleAPI.getAll({ limit: 500 }),
      ]);
      setClients(clientRes.data.data);
      setVehicles(vehicleRes.data.data);
    } catch (err) {
      console.error('Failed to load dropdown data');
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPolicies(search, filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters]);

  const handleClientChange = (clientId) => {
    setForm({ ...form, clientId, vehicleId: '' });
  };

  const getClientVehicles = () => {
    if (!form.clientId) return vehicles;
    return vehicles.filter((v) => {
      const vClientId = v.clientId?._id || v.clientId;
      return vClientId === form.clientId;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        premiumAmount: parseFloat(form.premiumAmount),
        idv: parseFloat(form.idv),
      };
      if (editMode) {
        await policyAPI.update(selectedId, payload);
        toast.success('Policy updated successfully');
      } else {
        await policyAPI.create(payload);
        toast.success('Policy created successfully');
      }
      setModalOpen(false);
      setForm(initialForm);
      setEditMode(false);
      fetchPolicies(search, filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (policy) => {
    setForm({
      vehicleId: policy.vehicleId?._id || policy.vehicleId || '',
      clientId: policy.clientId?._id || policy.clientId || '',
      policyNumber: policy.policyNumber,
      insuranceCompany: policy.insuranceCompany,
      policyType: policy.policyType,
      startDate: policy.startDate?.split('T')[0] || '',
      expiryDate: policy.expiryDate?.split('T')[0] || '',
      premiumAmount: policy.premiumAmount.toString(),
      idv: policy.idv.toString(),
      agentName: policy.agentName || '',
      renewalStatus: policy.renewalStatus,
    });
    setSelectedId(policy._id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (policy) => {
    if (window.confirm(`Delete policy "${policy.policyNumber}"?`)) {
      try {
        await policyAPI.delete(policy._id);
        toast.success('Policy deleted');
        fetchPolicies(search, filters);
      } catch (err) {
        toast.error('Failed to delete policy');
      }
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditMode(false);
    setSelectedId(null);
    setModalOpen(true);
  };

  const columns = [
    { key: 'policyNumber', label: 'Policy No.' },
    { key: 'client', label: 'Client', render: (row) => row.clientId?.fullName || 'N/A' },
    { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicleId?.vehicleNumber || 'N/A' },
    { key: 'insuranceCompany', label: 'Insurer' },
    {
      key: 'policyType',
      label: 'Type',
      render: (row) => (
        <span className={`type-badge type-${row.policyType?.toLowerCase().replace(/[\s-]/g, '')}`}>
          {row.policyType}
        </span>
      ),
    },
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="action-btns">
          <button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Edit">
            <MdEdit />
          </button>
          <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDelete(row); }} title="Delete">
            <MdDelete />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by policy number, insurer, agent..." />
        <div className="header-actions">
          <button className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowFilters(!showFilters)}>
            <MdFilterList /> Filters
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <MdAdd /> Add Policy
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-bar">
          <select
            value={filters.renewalStatus}
            onChange={(e) => setFilters({ ...filters, renewalStatus: e.target.value })}
          >
            <option value="">All Statuses</option>
            {renewalStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.policyType}
            onChange={(e) => setFilters({ ...filters, policyType: e.target.value })}
          >
            <option value="">All Types</option>
            {policyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => setFilters({ renewalStatus: '', policyType: '' })}>
            Clear Filters
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <DataTable columns={columns} data={policies} emptyMessage="No policies found. Add your first policy!" />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Policy' : 'Add New Policy'} size="large">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="policyClientId">Client *</label>
              <select id="policyClientId" value={form.clientId} onChange={(e) => handleClientChange(e.target.value)} required>
                <option value="">Select Client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.fullName} ({c.phone})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="policyVehicleId">Vehicle *</label>
              <select id="policyVehicleId" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                <option value="">Select Vehicle</option>
                {getClientVehicles().map((v) => (
                  <option key={v._id} value={v._id}>{v.vehicleNumber} - {v.makeModel}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="policyNumber">Policy Number *</label>
              <input id="policyNumber" type="text" value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} required placeholder="Enter policy number" />
            </div>
            <div className="form-group">
              <label htmlFor="insuranceCompany">Insurance Company *</label>
              <select id="insuranceCompany" value={form.insuranceCompany} onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })} required>
                <option value="">Select Company</option>
                {insuranceCompanies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="policyType">Policy Type *</label>
              <select id="policyType" value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })} required>
                {policyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="renewalStatus">Status</label>
              <select id="renewalStatus" value={form.renewalStatus} onChange={(e) => setForm({ ...form, renewalStatus: e.target.value })}>
                {renewalStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input id="expiryDate" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="premiumAmount">Premium Amount (₹) *</label>
              <input id="premiumAmount" type="number" value={form.premiumAmount} onChange={(e) => setForm({ ...form, premiumAmount: e.target.value })} required min="0" step="0.01" placeholder="e.g., 15000" />
            </div>
            <div className="form-group">
              <label htmlFor="idv">IDV (₹) *</label>
              <input id="idv" type="number" value={form.idv} onChange={(e) => setForm({ ...form, idv: e.target.value })} required min="0" step="0.01" placeholder="Insured Declared Value" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agentName">Agent Name</label>
              <input id="agentName" type="text" value={form.agentName} onChange={(e) => setForm({ ...form, agentName: e.target.value })} placeholder="Agent name" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Create'} Policy</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Policies;
