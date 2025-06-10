const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  lastname: String,
  firstname: String,
  phone: String,
  email: String,
  location: String,
  details: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
