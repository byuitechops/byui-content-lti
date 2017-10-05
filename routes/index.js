/*eslint-env node*/
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('test', {
    name: "Error! Try again Buster"
  });
});

module.exports = router;
