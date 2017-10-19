/*eslint-env node*/
var express = require('express');
var btoa = require('btoa');
var router = express.Router();
var equ = require('../modules/equella.js')
var ltiInfo;
/* POST home page to search */
router.post('/', function (req, res, next) {
  ltiInfo = req.lti
  res.render('index', {
    name: ltiInfo.lis_person_name_given,
    course: ltiInfo.context_title,
    courseId: ltiInfo.context_label,
    info: ltiInfo
  })
});

/* Redirect to CMS resource */
router.post('/content', function (req, res, next) {
  ltiInfo = req.lti.body
  req.session.fileName = req.query.name || "New Page";
  if (req.query.new == 'true') {
    req.session.equellaUrl = null;
    // add ability to set new page name later
    res.render('edit', {})

  } else {
    req.session.equellaUrl = req.query.url;
    if (ltiInfo.roles.includes('Instructor')) {
      res.render('edit', {})
    } else {
      res.redirect(req.session.equellaUrl)
    }
  }
})

module.exports = router;
