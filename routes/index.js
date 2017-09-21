var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("Confirmation page")
  res.render('test', {
    name: "Error! Try again Buster"
  });
});

/* POST home page. */
router.post('/', function (req, res, next) {
  var ltiInfo = req.lti.body
  res.render('index', {
    name: ltiInfo.lis_person_name_given,
    course: ltiInfo.context_title,
    info: ltiInfo
  });
});

/* POST home page. */
router.post('/pathtocontent', function (req, res, next) {
  var ltiInfo = req.lti.body
  res.render('test', {
    name: "Super Special Content page"
  });
});

module.exports = router;
