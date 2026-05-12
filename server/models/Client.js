const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function (v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit Indian mobile number',
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // email is optional
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address',
    },
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
}, {
  timestamps: true,
});

// Virtual to get all vehicles for this client
clientSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'clientId',
});

// Virtual to get all policies for this client
clientSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'clientId',
});

// Ensure virtuals are included in JSON output
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', clientSchema);
