const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const fanRoutes = require('./routes/fanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const worldcupRoutes = require('./routes/worldcupRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Disable ETag-based caching — API data changes frequently and should never
// be served stale from browser cache (was causing 304 responses with old data)
app.set('etag', false);

// Allow both local dev and the deployed Railway frontend to call this API.
const allowedOrigins = [
  'http://localhost:5173',
  'https://generous-expression-production-8758.up.railway.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/fan', fanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/worldcup', worldcupRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'SoccerSphere API running' }));

app.use(errorHandler);

module.exports = app;