const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  authentication: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // children
  user_files: [
    { type: Schema.Types.ObjectId, ref: 'Userfiles' }
  ]
});

module.exports = Users = mongoose.model('Users', UserSchema);