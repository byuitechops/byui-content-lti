/*eslint-env node*/
var express = require('express');
var router = express.Router();
var https = require('https');
var equ = require('../modules/equella.js');
var request = require('request')

var auth
if (!process.env.access_token) {
  auth = require('../auth.json')
} else {
  auth = {
    access_token: process.env.access_token
  }
}

/* API bridge: accepts Equella search, and returns the results to the LTI tool */
router.get('/searchContent', function (req, res, next) {
  var query = req.query.q;
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

router.get('/getCourseContent', function (req, res, next) {
  var courseId = req.query.courseId;
  var headers = {
    "X-Authorization": "access_token=" + auth.access_token
  }
  var options = {
    hostname: 'byuidev.equella.ecollege.com',
    port: 443,
    path: "/original/api/search/?start=0&length=10&reverse=false&where=%2Fxml%2FBYUI_extended%2FBYUI_information%2Fcourse_names%2Fcourse_name%20%3D%20'" + encodeURI(courseId) + "'%20&info=attachment&showall=false",
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

router.get('/equella', function (req, res, next) {
  var url = req.query.url;
  req.pipe(request.get(url, {
    headers: {
      "X-Authorization": "access_token=" + auth.access_token
    }
  })).pipe(res)
})

module.exports = router;
