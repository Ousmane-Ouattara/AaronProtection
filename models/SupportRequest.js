const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
