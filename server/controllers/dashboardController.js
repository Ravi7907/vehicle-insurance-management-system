const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');
const Policy = require('../models/Policy');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const [totalClients, totalVehicles, totalPolicies, totalPremium, expiringCount, expiredCount] = await Promise.all([
      Client.countDocuments(),
      Vehicle.countDocuments(),
      Policy.countDocuments(),
      Policy.aggregate([{ $group: { _id: null, total: { $sum: '$premiumAmount' } } }]),
      Policy.countDocuments({
        expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
        renewalStatus: { $in: ['Active', 'Pending'] },
      }),
      Policy.countDocuments({
        expiryDate: { $lt: today },
        renewalStatus: { $ne: 'Done' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalClients,
        totalVehicles,
        totalPolicies,
        totalPremium: totalPremium[0]?.total || 0,
        expiringPolicies: expiringCount,
        expiredPolicies: expiredCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get upcoming renewals (next 30 days)
// @route   GET /api/v1/dashboard/renewals
exports.getUpcomingRenewals = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const renewals = await Policy.find({
      expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
      renewalStatus: { $in: ['Active', 'Pending'] },
    })
      .populate('clientId', 'fullName phone')
      .populate('vehicleId', 'vehicleNumber makeModel')
      .sort({ expiryDate: 1 })
      .limit(20);

    res.json({ success: true, data: renewals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly report data
// @route   GET /api/v1/reports/monthly
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = await Policy.aggregate([
      {
        $match: {
          expiryDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$expiryDate' },
          count: { $sum: 1 },
          totalPremium: { $sum: '$premiumAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing months with zeros
    const months = Array.from({ length: 12 }, (_, i) => {
      const existing = monthlyData.find((d) => d._id === i + 1);
      return {
        month: i + 1,
        count: existing?.count || 0,
        totalPremium: existing?.totalPremium || 0,
      };
    });

    res.json({ success: true, data: months });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get premium by insurance company
// @route   GET /api/v1/reports/companies
exports.getCompanyReport = async (req, res) => {
  try {
    const companyData = await Policy.aggregate([
      {
        $group: {
          _id: '$insuranceCompany',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premiumAmount' },
        },
      },
      { $sort: { totalPremium: -1 } },
    ]);

    res.json({ success: true, data: companyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get agent commission report
// @route   GET /api/v1/reports/agents
exports.getAgentReport = async (req, res) => {
  try {
    const agentData = await Policy.aggregate([
      {
        $match: { agentName: { $ne: '' } },
      },
      {
        $group: {
          _id: '$agentName',
          policiesSold: { $sum: 1 },
          totalPremium: { $sum: '$premiumAmount' },
        },
      },
      { $sort: { policiesSold: -1 } },
    ]);

    res.json({ success: true, data: agentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get renewal status distribution
// @route   GET /api/v1/reports/renewal-status
exports.getRenewalStatusReport = async (req, res) => {
  try {
    const statusData = await Policy.aggregate([
      {
        $group: {
          _id: '$renewalStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: statusData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
