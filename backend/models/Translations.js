const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const TranslationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  time_interval: {
    type: Number,
    default: 600000
  },
  time_last_requested: {
    type: Number,
    default: 0
  },
  base_url: {
    type: String,
    required: true
  },
  token: {
    type: String,
  },
});

module.exports = Translations = mongoose.model('Translations', TranslationSchema);