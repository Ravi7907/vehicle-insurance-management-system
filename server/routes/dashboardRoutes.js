const express = require('express');
const router = express.Router();
const {
  getStats,
  getUpcomingRenewals,
  getMonthlyReport,
  getCompanyReport,
  getAgentReport,
  getRenewalStatusReport,
} = require('../controllers/dashboardController');

router.get('/stats', getStats);
router.get('/renewals', getUpcomingRenewals);
router.get('/reports/monthly', getMonthlyReport);
router.get('/reports/companies', getCompanyReport);
router.get('/reports/agents', getAgentReport);
router.get('/reports/renewal-status', getRenewalStatusReport);

module.exports = router;
