const documents = require('./documents');

module.exports = (app, checkJwt) => {
  // app.use('/api/translate/documents', checkJwt, documents);
  app.use('/api/translate/documents', documents);
}