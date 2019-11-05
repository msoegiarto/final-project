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
app.use(fileUpload({
  limits: { fileSize: 100000 },
}));
app.use(cors());

// Connect to Mongo
var mongo_uri = 'MONGO_URI';
if (!process.env[mongo_uri]) throw new Error('Please set/export the following environment variable: ' + mongo_uri);
mongoose.connect(process.env[mongo_uri], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// app.use('/api/translate/documents', checkJwt, documents);
app.use('/api/translate/documents', documents);

if (process.env.NODE_ENV === 'production') {
  //Static file declaration
  app.use(express.static(path.join(__dirname, '../client/build')));
  //build mode 
  app.get('*', (req, res) => { res.sendfile(path.join(__dirname = '../client/build/index.html')); })
} else {
  app.get('*', (req, res) => res.json({ msg: `Welcome to ${req.hostname}` }));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));