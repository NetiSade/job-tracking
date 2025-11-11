const express = require('express');
const cors = require('cors');
require('dotenv').config();

const jobsRouter = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Job Tracking API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

