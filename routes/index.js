var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Nothing Here'
  });
});

/* POST home page. */
router.post('/', function (req, res, next) {
  console.log(req.lti)
  console.log(req.session)
  var ltiInfo = req.lti.body
  res.render('index', {
    name: ltiInfo.lis_person_name_given,
    course: ltiInfo.context_title,
    info: ltiInfo
  });
});

module.exports = router;
