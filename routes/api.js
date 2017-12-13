/*eslint-env node*/
/* These endpoints are used from the interface presented when the LTI launch is initiated */

var express = require('express');
var router = express.Router();
var https = require('https');
var equ = require('../modules/equella.js');
var request = require('request');
var btoa = require('btoa');
var git = require('../modules/github.js')

/* Check for a production environment, else use a local token for canvas authentication */
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
    path: '/original/api/search/?q=' + query + '&start=0&length=10&reverse=false&info=basic%2Cattachment&showall=false',
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

/* Returns a list of items that are tagged with the course code */
router.get('/getCourseContent', function (req, res, next) {
  var courseId = req.query.courseId;
  var headers = {
    "X-Authorization": "access_token=" + auth.access_token
  }
  var options = {
    hostname: 'byuidev.equella.ecollege.com',
    port: 443,
    path: "/original/api/search/?start=0&length=10&reverse=false&where=%2Fxml%2FBYUI_extended%2FBYUI_information%2Fcourse_names%2Fcourse_name%20%3D%20'" + encodeURI(courseId) + "'%20&info=basic%2Cattachment&showall=false",
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

/* the update content endpoint. THis spawns the git commit, and the Equella update (Not working now)*/
router.put('/content', function (req, res, next) {
  //actually use logic to get user's key here
  if (!req.session.equellaUrl) {
    next("No equella url provided")
  }
  var gitSuccess = null,
    equSuccess = null;
  git.commitChanges(req.session, req.body, function (data) {
    if (data.success) {
      console.log("Updating sha")
      req.session.file_sha = data.sha;
    }
    gitSuccess = data.success
    respond()
  })
//  equ.updateAttachment(req.session.equellaUrl, req.body, function (data) {
//    if (data.success) {
//      console.log("Updated Equella")
//    }
//    equSuccess = data.success
//  })

  function respond() {
    if ((gitSuccess !== null) /*&& (equSuccess !== null)*/) {
      res.json({
        gitSuccess: gitSuccess,
        equSuccess: equSuccess,
        success: gitSuccess && equSuccess
      })
    }
  }
})

/* This gets the gitHub page for the equella content.
   Right now it is just matching the name of the file.
   More sofisticated organization should be decided upon. */
router.get('/content', function (req, res, next) {
  if (!req.session.equellaUrl) {
    next("No equella url provided")
  }
  var equellaUrl = req.session.equellaUrl;
  var uriName;
  if (equellaUrl.split('/')[4] === 'file') {
    uriName = equellaUrl.split('/')[7]
    getPage()
  } else {
    equ.getAttachment(equellaUrl, function (attachment) {
      uriName = encodeURI(attachment.description)
      getPage()
    })
  }

  function getPage() {
    req.session.fileName = decodeURI(uriName);
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

/* This creates a new page's item and attachment in equella */
router.post('/content', function (req, res, next) {
  var fileName = req.query.file_name;
  var content = "<h1>" + fileName + "</h1>";
  equ.createAttachment(fileName, content, function (response) {
    res.json({
      url: 'https://byui.instructure.com/courses/142/external_content/success/external_tool_dialog?return_type=lti_launch_url&url=https%3A%2F%2Flocalhost%3A1830%2Flti%2Fcontent%2F%3Furl=' + escape(encodeURIComponent(response.contentUrl)) + '&title=' + escape(fileName)
    })
  })
})

module.exports = router;
