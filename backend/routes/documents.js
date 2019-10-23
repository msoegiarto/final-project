// const db = require('../config/database');
const Router = require('express').Router;

const router = new Router();

/**
 * @GET /api/translate/document s
 * 
 */
router.get('*', (req, res, next) => {
  // const id = req.params.id;
  // selectById(id, (error, result) => {
  //   if (error) return next(error);

  //   if (result.rows[0]) {
  //     res.send(result.rows[0]);
  //   } else {
  //     res.send({ msg: `Cannot find a user with id=${id}` });
  //   }
  // });
  res.json({ msg: `sent from /api/translate/documents` });
});

module.exports = router;