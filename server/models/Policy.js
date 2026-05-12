const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required'],
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required'],
  },
  policyNumber: {
    type: String,
    required: [true, 'Policy number is required'],
    unique: true,
    trim: true,
  },
  insuranceCompany: {
    type: String,
    required: [true, 'Insurance company is required'],
    trim: true,
  },
  policyType: {
    type: String,
    required: [true, 'Policy type is required'],
    enum: {
      values: ['Comprehensive', 'Third-Party', 'Own Damage'],
      message: 'Policy type must be one of: Comprehensive, Third-Party, Own Damage',
    },
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  premiumAmount: {
    type: Number,
    required: [true, 'Premium amount is required'],
    min: [0, 'Premium amount cannot be negative'],
  },
  idv: {
    type: Number,
    required: [true, 'IDV (Insured Declared Value) is required'],
    min: [0, 'IDV cannot be negative'],
  },
  agentName: {
    type: String,
    trim: true,
    default: '',
  },
  renewalStatus: {
    type: String,
    enum: {
      values: ['Active', 'Pending', 'Done', 'Expired'],
      message: 'Renewal status must be one of: Active, Pending, Done, Expired',
    },
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Validate that expiryDate is after startDate
policySchema.pre('validate', async function () {
  if (this.expiryDate && this.startDate && this.expiryDate <= this.startDate) {
    this.invalidate('expiryDate', 'Expiry date must be after start date');
  }
});

module.exports = mongoose.model('Policy', policySchema);
