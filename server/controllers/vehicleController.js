const Vehicle = require('../models/Vehicle');
const Policy = require('../models/Policy');

// @desc    Get all vehicles
// @route   GET /api/v1/vehicles
exports.getVehicles = async (req, res) => {
  try {
    const { search, clientId, page = 1, limit = 20 } = req.query;
    let query = {};

    if (clientId) {
      query.clientId = clientId;
    }

    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { makeModel: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate('clientId', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: vehicles,
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

// @desc    Get single vehicle with policies
// @route   GET /api/v1/vehicles/:id
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('clientId', 'fullName phone email');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const policies = await Policy.find({ vehicleId: vehicle._id });

    res.json({
      success: true,
      data: { ...vehicle.toObject(), policies },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new vehicle
// @route   POST /api/v1/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    const populated = await Vehicle.findById(vehicle._id)
      .populate('clientId', 'fullName phone');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this registration number already exists',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/v1/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('clientId', 'fullName phone');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this registration number already exists',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete vehicle (cascade delete policies)
// @route   DELETE /api/v1/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await Policy.deleteMany({ vehicleId: vehicle._id });
    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Vehicle and all related policies deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
