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
  if (req.query.new == 'true') {
    res.render('edit', {
      fileName: req.query.name || 'New Page',
      equellaUrl: null,
      lti_user_private_key: btoa(ltiInfo.lis_person_contact_email_primary + ":" + ltiInfo.user_id),
      name: ltiInfo.lis_person_name_given,
      course: ltiInfo.context_title
    })
  } else {
    var resourceUrl = req.query.url
    if (ltiInfo.roles.includes('Instructor')) {
      var itemId = resourceUrl.split('/')[5]
      var version = resourceUrl.split('/')[6]
      var attachmentId = resourceUrl.split('=')[1]
      equ.getAttachment(itemId, attachmentId, version, function (attachment) {
        res.render('edit', {
          fileName: attachment.description,
          /*needs fixed: not sure how we are going to authenticate with github*/
          lti_user_private_key: btoa(ltiInfo.lis_person_contact_email_primary + ":" + ltiInfo.user_id),
          equellaUrl: resourceUrl,
          name: ltiInfo.lis_person_name_given,
          course: ltiInfo.context_title
        })
      })
    } else {
      res.redirect(resourceUrl)
    }
  }
})

module.exports = router;
