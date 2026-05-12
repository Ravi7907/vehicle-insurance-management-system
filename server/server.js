const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const checkRenewals = require('./utils/renewalChecker');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/clients', require('./routes/clientRoutes'));
app.use('/api/v1/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/v1/policies', require('./routes/policyRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Insurance Management API is running' });
});

// Vercel handles static frontend distribution natively.

// Error handler (must be after routes)
app.use(errorHandler);

// Vercel native cron endpoint
app.get('/api/cron/renewals', async (req, res) => {
  console.log('⏰ Running daily renewal check via Vercel Cron...');
  await checkRenewals();
  res.json({ status: 'OK', message: 'Renewal check triggered successfully' });
});

// Standalone execution for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 API: http://localhost:${PORT}/api/v1`);
  });
}

// Export for Vercel Serverless
module.exports = app;
