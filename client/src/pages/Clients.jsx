import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  dateOfBirth: '',
};

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const fetchClients = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await clientAPI.getAll({ search: searchTerm, limit: 100 });
      setClients(res.data.data);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await clientAPI.update(selectedId, form);
        toast.success('Client updated successfully');
      } else {
        await clientAPI.create(form);
        toast.success('Client created successfully');
      }
      setModalOpen(false);
      setForm(initialForm);
      setEditMode(false);
      fetchClients(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (client) => {
    setForm({
      fullName: client.fullName,
      phone: client.phone,
      email: client.email || '',
      address: client.address,
      dateOfBirth: client.dateOfBirth?.split('T')[0] || '',
    });
    setSelectedId(client._id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (client) => {
    if (window.confirm(`Delete "${client.fullName}" and all related vehicles/policies?`)) {
      try {
        await clientAPI.delete(client._id);
        toast.success('Client deleted successfully');
        fetchClients(search);
      } catch (err) {
        toast.error('Failed to delete client');
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
    { key: 'fullName', label: 'Full Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', render: (row) => row.email || '—' },
    { key: 'address', label: 'Address', render: (row) => row.address?.substring(0, 30) + (row.address?.length > 30 ? '...' : '') },
    {
      key: 'dateOfBirth',
      label: 'DOB',
      render: (row) => row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString('en-IN') : '—',
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search clients by name, phone, email..." />
        <button className="btn btn-primary" onClick={openAddModal}>
          <MdAdd /> Add Client
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          onRowClick={(row) => navigate(`/clients/${row._id}`)}
          emptyMessage="No clients found. Add your first client!"
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Client' : 'Add New Client'}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              placeholder="Enter full name"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              placeholder="Enter full address"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Create'} Client</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
