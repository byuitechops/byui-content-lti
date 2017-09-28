/*eslint-env node*/
var express = require('express');
var router = express.Router();
var https = require('https');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('test', {
    name: "Error! Try again Buster"
  });
});
var auth
if (!process.env.access_token) {
  auth = require('../auth.json')
} else {
  auth = {
    access_token: process.env.access_token
  }
}

/* POST home page to search */
router.post('/', function (req, res, next) {
  var ltiInfo = req.lti.body
  res.render('index', {
    name: ltiInfo.lis_person_name_given,
    course: ltiInfo.context_title,
    info: ltiInfo
  })
});

/* Redirect to equella resource */
router.post('/equella/:resourceUrl', function (req, res, next) {
  var resourceUrl = req.params["resourceUrl"];
  res.redirect(resourceUrl)
})

/* POST home page. */
router.post('/pathtocontent', function (req, res, next) {
  var ltiInfo = req.lti.body

  res.render('test', {
    name: "Super Special Content page"
  });
});

router.get('/search/:query', function (req, res, next) {
  var query = req.params["query"];
  var headers = {
    "X-Authorization": "access_token=" + auth.access_token
  }
  var options = {
    hostname: 'byuidev.equella.ecollege.com',
    port: 443,
    path: '/original/api/search/?q=' + query + '&start=0&length=10&reverse=false&info=attachment&showall=false',
    method: 'GET',
    headers: headers
  }
  var data = ""
  var request = https.request(options, function (response) {
    response.on('data', function (chunk) {
      data += chunk
    })
    response.on('end', function () {
      res.json(JSON.parse(data))
    })
  })
  request.end();
})

module.exports = router;
