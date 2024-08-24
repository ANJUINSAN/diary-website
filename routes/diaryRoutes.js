const express = require('express');
const DiaryEntry = require('../models/diaryEntry');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authMiddleware to all diary routes
router.use(authMiddleware);

// Get all diary entries for the authenticated user
router.get('/', async (req, res) => {
  try {
    console.log('Fetching entries for user:', req.user._id); // Log user ID
    const entries = await DiaryEntry.find({ userId: req.user._id });
    console.log('Entries found:', entries); // Log entries
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    res.status(500).json({ message: 'Error fetching diary entries' });
  }
});

// Get diary entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Diary entry not found' });
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching diary entry:', error);
    res.status(500).json({ message: 'Error fetching diary entry' });
  }
});

// Check if an entry exists for a specific date
// Route to check for an entry by date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const entry = await DiaryEntry.findOne({
      date: { $gte: startOfDay, $lt: endOfDay },
      userId: req.user._id
    });

    if (entry) {
      return res.status(200).json(entry);
    } else {
      return res.status(404).json({ message: 'No entry found for this date' });
    }
  } catch (error) {
    console.error('Error checking entry by date:', error);
    res.status(500).json({ message: error.message });
  }
});


// Create a new diary entry
router.post('/', async (req, res) => {
  const { date, content } = req.body;

  try {
    const existingEntry = await DiaryEntry.findOne({ date, userId: req.user._id });
    if (existingEntry) {
      return res.status(400).json({ message: 'Entry already exists for this date' });
    }

    const entry = new DiaryEntry({ date, content, userId: req.user._id });
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating diary entry:', error);
    res.status(400).json({ message: 'Error creating diary entry' });
  }
});

// Update a diary entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, content } = req.body;

  try {
    // Log input values for debugging
    console.log('Updating entry with ID:', id);
    console.log('Request body:', req.body);

    // Ensure you are updating the correct entry
    const updatedEntry = await DiaryEntry.findOneAndUpdate(
      { _id: id, userId: req.user._id },  // Query condition
      { date, content },  // Fields to update
      { new: true, runValidators: true }  // Return the updated document and validate
    );

    if (!updatedEntry) return res.status(404).json({ message: 'Diary entry not found' });

    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating diary entry:', error);
    res.status(500).json({ message: 'Error updating diary entry' });
  }
});


module.exports = router;
