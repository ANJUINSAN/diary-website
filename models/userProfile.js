const mongoose = require('mongoose');
const argon2 = require('argon2');

const userProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving user profile
userProfileSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await argon2.hash(this.password.trim());
      console.log(`Password hashed: ${this.password}`);
    } catch (error) {
      console.error('Error during password hashing:', error);
      next(error);
    }
  }
  next();
});

// Compare given password with stored hashed password
userProfileSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await argon2.verify(this.password, password.trim());
    console.log(`Entered password: ${password}`);
    console.log(`Stored hashed password: ${this.password}`);
    console.log(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('Error during password comparison:', error);
    throw error;
  }
};

// Static method to find user by credentials
userProfileSchema.statics.findByCredentials = async function (username, password) {
  try {
    const user = await this.findOne({ username });
    if (!user) {
      console.error(`User not found with username: ${username}`);
      throw new Error('Invalid credentials');
    }
    console.log(`User found: ${JSON.stringify(user, null, 2)}`);
    const isMatch = await user.comparePassword(password);
    console.log(`Password match: ${isMatch}`);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    return user;
  } catch (error) {
    console.error('Error during user authentication:', error);
    throw error;
  }
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
