const express = require('express');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const createError = require('http-errors');
const winston = require('./config/winston'); // We'll create this next

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('combined', { stream: winston.stream }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BDA Backend API' });
});

// 404 handler
app.use((req, res, next) => {
  next(createError.NotFound('Route not found'));
});

// Error handler middleware
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Add this line to include winston logging
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Send error response
  res.status(err.status || 500).json({
    status: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;