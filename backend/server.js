require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const checkJwt = require('./middleware/Auth0/checkJwt');
const mongoose = require('mongoose');
const path = require('path');
const PORT = process.env.PORT || 5000;
const documents = require('./routes/documents');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// app.use('/api/translate/documents', checkJwt, documents);
app.use('/api/translate/documents', documents);

app.get('*', (req, res) => res.json({ msg: `Welcome to ${req.hostname}` }));

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));