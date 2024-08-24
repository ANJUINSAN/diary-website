// backend/server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const helmet = require('helmet'); // For security headers
// const cors = require('cors'); // For CORS

const app = express();


app.use(express.json()); // To parse JSON bodies
app.use(helmet()); // Security headers
// app.use(cors()); // Enable CORS

// Serve static files from the "public/build" directory
app.use(express.static(path.join(__dirname, 'public/build')));

mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

// Define Routes
const userRoutes = require('./routes/userRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
app.use('/api/users', userRoutes);
app.use('/api/diary', diaryRoutes);

// Handle React routing, return index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
