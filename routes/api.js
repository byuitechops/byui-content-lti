/*eslint-env node*/
var express = require('express');
var router = express.Router();
var https = require('https');
var equ = require('../modules/equella.js');
var request = require('request');
var btoa = require('btoa');
var git = require('../modules/github.js')

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

router.put('/content', function (req, res, next) {
  //actually use logic to get user's key here
  git.commitChanges(req.session, req.body, function (data) {
    console.log(data)
    if (data.success) {
      console.log("updating sha")
      req.session.file_sha = data.sha;
    }
    res.json({
      sucess: data.succes
    })
  })
})

router.get('/content', function (req, res, next) {
  var equellaUrl = req.session.equellaUrl;
  //check if new item
  if (equellaUrl === null) {
    var content = "<h1>New Document</h1>";
    equ.createAttachment(req, req.session.fileName, content, function (response) {
      git.createPage(req.session.fileName, content, returnPage);
    })
  } else {
    //if not, get Equella details
    var itemId = equellaUrl.split('/')[5]
    var version = equellaUrl.split('/')[6]
    var attachmentId = equellaUrl.split('=')[1]
    equ.getAttachment(itemId, attachmentId, version, function (attachment) {
      req.session.fileName = attachment.description;
      var uriName = encodeURI(req.session.fileName)
      var url = 'https://api.github.com/repos/byuitechops/content_editor_v2/contents/' + uriName;
      //get github page if it exists
      request({
        url: url,
        headers: {
          "User-Agent": 'LTIBrain'
        }
      }, function (err, value, body) {
        if (value.statusCode == 404) {
          //if not, create the new page with Equella content
          equ.getContent(equellaUrl, function (equBody) {
            git.createPage(uriName, equBody, returnPage)
          });
        } else {
          //finish the request
          returnPage(JSON.parse(body))
        }
      })
    })
  }

  function returnPage(body) {
    req.session.fileName = body.name;
    req.session.file_sha = body.sha;
    req.session.file_path = encodeURI(body.path);
    request(body.download_url, function (err, result, docBody) {
      res.json({
        title: body.name,
        document: docBody
      })
    })
  }
})

module.exports = router;
