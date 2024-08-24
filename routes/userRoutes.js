// backend/routes/userRoutes.js
const express = require('express');
const UserProfile = require('../models/userProfile');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const Joi = require('joi');

// Unified schema for both registration and login
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(3).required()
});

// Register new user
router.post('/', async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, password } = req.body;
    const existingUser = await UserProfile.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const user = new UserProfile({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, password } = req.body;
    const user = await UserProfile.findByCredentials(username, password);
    
    // Generate JWT token
    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ message: 'Invalid username or password' });
    } else {
      console.error('Error during login:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
