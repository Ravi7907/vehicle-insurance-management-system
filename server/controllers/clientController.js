const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');
const Policy = require('../models/Policy');

// @desc    Get all clients
// @route   GET /api/v1/clients
exports.getClients = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: clients,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single client with vehicles and policies
// @route   GET /api/v1/clients/:id
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const vehicles = await Vehicle.find({ clientId: client._id });
    const policies = await Policy.find({ clientId: client._id })
      .populate('vehicleId', 'vehicleNumber makeModel');

    res.json({
      success: true,
      data: { ...client.toObject(), vehicles, policies },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new client
// @route   POST /api/v1/clients
exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A client with this phone number already exists',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/v1/clients/:id
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A client with this phone number already exists',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete client (cascade delete vehicles and policies)
// @route   DELETE /api/v1/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Cascade delete: remove all policies and vehicles linked to this client
    await Policy.deleteMany({ clientId: client._id });
    await Vehicle.deleteMany({ clientId: client._id });
    await Client.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Client and all related records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
