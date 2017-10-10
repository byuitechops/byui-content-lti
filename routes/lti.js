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
    res.render('edit', {
      //      fileName: req.query.name || 'New Page',
      //      name: ltiInfo.lis_person_name_given,
      //      course: ltiInfo.context_title,
      //      equellaUrl: null
    })
  } else {
    req.session.equellaUrl = req.query.url;
    if (ltiInfo.roles.includes('Instructor')) {
      //      var itemId = req.equellaUrl.split('/')[5]
      //      var version = req.equellaUrl.split('/')[6]
      //      var attachmentId = req.equellaUrl.split('=')[1]
      //      equ.getAttachment(itemId, attachmentId, version, function (attachment) {
      res.render('edit', {
        //          fileName: attachment.description,
        //          name: ltiInfo.lis_person_name_given,
        //          course: ltiInfo.context_title,
        //        equellaUrl: req.session.equellaUrl
      })
      //    })
    } else {
      res.redirect(req.session.equellaUrl)
    }
  }
})

module.exports = router;
