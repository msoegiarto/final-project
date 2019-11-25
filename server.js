require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const PORT = process.env.PORT || 5000;
const routes = require('./routes/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 100000 },
}));
app.use(cors({ exposedHeaders: 'Content-Disposition' }));
app.use((req, res, next) => {
  res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
  next();
});

// environment variables validation
if (!process.env.MONGO_URI)
  throw new Error('Please set/export the following environment variable: MONGO_URI');
if (!process.env.AUTH0_DOMAIN)
  throw new Error('Please set/export the following environment variable: AUTH0_DOMAIN');
if (!process.env.AUTH0_AUDIENCE)
  throw new Error('Please set/export the following environment variable: AUTH0_AUDIENCE');

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

routes(app);

if (process.env.NODE_ENV === 'production') {
  console.log('production');
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'client/build', 'index.html')) });
} else {
  app.get('*', (req, res) => res.json({ msg: `Welcome to ${req.hostname}` }));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));