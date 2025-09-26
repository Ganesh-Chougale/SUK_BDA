const express = require('express');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const createError = require('http-errors');
const winston = require('./config/winston');
const path = require('path'); // 👈 ADDED: Import 'path' for file handling
const app = express();

// Import routes
const authRoutes = require('./routes/auth.routes');

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.240.237.70:3000',
  process.env.FRONTEND_URL,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('combined', { stream: winston.stream }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BDA Backend API' });
});

// FedCM Configuration Endpoint (must be before the main error handlers/router)
app.get('/.well-known/web-identity', (req, res) => {
  // Set simple CORS headers required by FedCM for this static file
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Use absolute path for robustness
  const configPath = path.join(__dirname, 'config', 'fedcm.json');
  res.sendFile(configPath);
});

// Use routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res, next) => {
  next(createError.NotFound('Route not found'));
});

// Error handler middleware
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    status: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;