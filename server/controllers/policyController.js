const Policy = require('../models/Policy');

// @desc    Get all policies
// @route   GET /api/v1/policies
exports.getPolicies = async (req, res) => {
  try {
    const { search, renewalStatus, policyType, insuranceCompany, clientId, vehicleId, page = 1, limit = 20 } = req.query;
    let query = {};

    if (clientId) query.clientId = clientId;
    if (vehicleId) query.vehicleId = vehicleId;
    if (renewalStatus) query.renewalStatus = renewalStatus;
    if (policyType) query.policyType = policyType;
    if (insuranceCompany) query.insuranceCompany = { $regex: insuranceCompany, $options: 'i' };

    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { insuranceCompany: { $regex: search, $options: 'i' } },
        { agentName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Policy.countDocuments(query);
    const policies = await Policy.find(query)
      .populate('clientId', 'fullName phone')
      .populate('vehicleId', 'vehicleNumber makeModel')
      .sort({ expiryDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: policies,
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

// @desc    Get single policy
// @route   GET /api/v1/policies/:id
exports.getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('clientId', 'fullName phone email address')
      .populate('vehicleId', 'vehicleNumber makeModel yearOfManufacture fuelType');

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get policies expiring within N days
// @route   GET /api/v1/policies/expiring
exports.getExpiringPolicies = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const policies = await Policy.find({
      expiryDate: { $gte: today, $lte: futureDate },
      renewalStatus: { $in: ['Active', 'Pending'] },
    })
      .populate('clientId', 'fullName phone')
      .populate('vehicleId', 'vehicleNumber makeModel')
      .sort({ expiryDate: 1 });

    res.json({ success: true, data: policies, count: policies.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new policy
// @route   POST /api/v1/policies
exports.createPolicy = async (req, res) => {
  try {
    const policy = await Policy.create(req.body);
    const populated = await Policy.findById(policy._id)
      .populate('clientId', 'fullName phone')
      .populate('vehicleId', 'vehicleNumber makeModel');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A policy with this policy number already exists',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update policy
// @route   PUT /api/v1/policies/:id
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('clientId', 'fullName phone')
      .populate('vehicleId', 'vehicleNumber makeModel');

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A policy with this policy number already exists',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete policy
// @route   DELETE /api/v1/policies/:id
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
