require('dotenv').config();
const express = require('express');
const checkJwt = require('./middleware/Auth0/checkJwt');
const path = require('path');
const PORT = process.env.PORT || 5000;
const documents = require('./routes/documents');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/translate/documents', checkJwt, documents);

app.get('*', (req, res) => res.json({ msg: `Welcome to ${req.hostname}` }));

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));