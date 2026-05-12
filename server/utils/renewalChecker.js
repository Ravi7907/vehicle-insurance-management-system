const Policy = require('../models/Policy');

/**
 * Check for policies expiring in the next 30 days
 * and update their status to 'Pending'.
 * Also mark expired policies as 'Expired'.
 */
const checkRenewals = async () => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Mark policies expiring within 30 days as 'Pending'
    const pendingResult = await Policy.updateMany(
      {
        expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
        renewalStatus: 'Active',
      },
      { $set: { renewalStatus: 'Pending' } }
    );

    // Mark expired policies as 'Expired'
    const expiredResult = await Policy.updateMany(
      {
        expiryDate: { $lt: today },
        renewalStatus: { $in: ['Active', 'Pending'] },
      },
      { $set: { renewalStatus: 'Expired' } }
    );

    if (pendingResult.modifiedCount > 0 || expiredResult.modifiedCount > 0) {
      console.log(`🔔 Renewal Check: ${pendingResult.modifiedCount} policies marked as Pending, ${expiredResult.modifiedCount} marked as Expired`);
    }
  } catch (error) {
    console.error('❌ Renewal check error:', error.message);
  }
};

module.exports = checkRenewals;
