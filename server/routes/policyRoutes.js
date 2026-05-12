const express = require('express');
const router = express.Router();
const {
  getPolicies,
  getPolicy,
  getExpiringPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');

// Expiring policies route must come before /:id to avoid conflicts
router.get('/expiring', getExpiringPolicies);

router.route('/').get(getPolicies).post(createPolicy);
router.route('/:id').get(getPolicy).put(updatePolicy).delete(deletePolicy);

module.exports = router;
