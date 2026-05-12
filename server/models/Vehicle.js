const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required'],
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Indian vehicle registration format: MH12AB1234 or MH 12 AB 1234
        return /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Please enter a valid Indian vehicle registration number (e.g., MH12AB1234)',
    },
  },
  makeModel: {
    type: String,
    required: [true, 'Make & Model is required'],
    trim: true,
  },
  yearOfManufacture: {
    type: Number,
    required: [true, 'Year of manufacture is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
  },
  engineChassisNumber: {
    type: String,
    required: [true, 'Engine/Chassis number is required'],
    trim: true,
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: {
      values: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
      message: 'Fuel type must be one of: Petrol, Diesel, CNG, Electric, Hybrid',
    },
  },
}, {
  timestamps: true,
});

// Virtual to get all policies for this vehicle
vehicleSchema.virtual('policies', {
  ref: 'Policy',
  localField: '_id',
  foreignField: 'vehicleId',
});

vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
