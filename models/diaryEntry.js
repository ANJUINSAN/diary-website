const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true } // Reference to the user
});

// Add a unique index to ensure a single entry per user per date
diaryEntrySchema.index({ date: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
