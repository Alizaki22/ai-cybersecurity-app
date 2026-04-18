require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));
app.use(helmet());
app.use(morgan('dev'));

const analyzeRoutes = require('./routes/analyzeRoutes');

// Basic route
app.get('/', (req, res) => {
  res.send('AI-Based Cybersecurity Awareness App API');
});

// API Routes
app.use('/api/analyze', analyzeRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
