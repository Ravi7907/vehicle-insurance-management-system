import { useEffect, useState } from 'react';
import { vehicleAPI, clientAPI } from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';

const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

const initialForm = {
  clientId: '',
  vehicleNumber: '',
  makeModel: '',
  yearOfManufacture: '',
  engineChassisNumber: '',
  fuelType: 'Petrol',
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const fetchVehicles = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await vehicleAPI.getAll({ search: searchTerm, limit: 100 });
      setVehicles(res.data.data);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await clientAPI.getAll({ limit: 500 });
      setClients(res.data.data);
    } catch (err) {
      console.error('Failed to load clients for dropdown');
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchVehicles(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, yearOfManufacture: parseInt(form.yearOfManufacture) };
      if (editMode) {
        await vehicleAPI.update(selectedId, payload);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleAPI.create(payload);
        toast.success('Vehicle added successfully');
      }
      setModalOpen(false);
      setForm(initialForm);
      setEditMode(false);
      fetchVehicles(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (vehicle) => {
    setForm({
      clientId: vehicle.clientId?._id || vehicle.clientId || '',
      vehicleNumber: vehicle.vehicleNumber,
      makeModel: vehicle.makeModel,
      yearOfManufacture: vehicle.yearOfManufacture.toString(),
      engineChassisNumber: vehicle.engineChassisNumber,
      fuelType: vehicle.fuelType,
    });
    setSelectedId(vehicle._id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (vehicle) => {
    if (window.confirm(`Delete vehicle "${vehicle.vehicleNumber}" and all related policies?`)) {
      try {
        await vehicleAPI.delete(vehicle._id);
        toast.success('Vehicle deleted');
        fetchVehicles(search);
      } catch (err) {
        toast.error('Failed to delete vehicle');
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
    { key: 'vehicleNumber', label: 'Reg. Number' },
    {
      key: 'client',
      label: 'Owner',
      render: (row) => row.clientId?.fullName || 'N/A',
    },
    { key: 'makeModel', label: 'Make & Model' },
    { key: 'yearOfManufacture', label: 'Year' },
    {
      key: 'fuelType',
      label: 'Fuel',
      render: (row) => (
        <span className={`fuel-badge fuel-${row.fuelType?.toLowerCase()}`}>
          {row.fuelType}
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search by vehicle number or model..." />
        <button className="btn btn-primary" onClick={openAddModal}>
          <MdAdd /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <DataTable columns={columns} data={vehicles} emptyMessage="No vehicles found. Add your first vehicle!" />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Vehicle' : 'Add New Vehicle'}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="clientId">Client (Owner) *</label>
            <select
              id="clientId"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.fullName} ({c.phone})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleNumber">Vehicle Number *</label>
              <input
                id="vehicleNumber"
                type="text"
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., MH12AB1234"
              />
            </div>
            <div className="form-group">
              <label htmlFor="makeModel">Make & Model *</label>
              <input
                id="makeModel"
                type="text"
                value={form.makeModel}
                onChange={(e) => setForm({ ...form, makeModel: e.target.value })}
                required
                placeholder="e.g., Maruti Swift"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yearOfManufacture">Year of Manufacture *</label>
              <input
                id="yearOfManufacture"
                type="number"
                value={form.yearOfManufacture}
                onChange={(e) => setForm({ ...form, yearOfManufacture: e.target.value })}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder="e.g., 2022"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type *</label>
              <select
                id="fuelType"
                value={form.fuelType}
                onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                required
              >
                {fuelTypes.map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="engineChassisNumber">Engine / Chassis Number *</label>
            <input
              id="engineChassisNumber"
              type="text"
              value={form.engineChassisNumber}
              onChange={(e) => setForm({ ...form, engineChassisNumber: e.target.value })}
              required
              placeholder="Enter engine or chassis number"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Add'} Vehicle</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
