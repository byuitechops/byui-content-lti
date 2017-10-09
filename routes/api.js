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
  console.log("Getting: ", url)
  req.pipe(request.get(url, {
    headers: {
      "X-Authorization": "access_token=" + auth.access_token
    }
  })).pipe(res)
})

router.post('/commit', function (req, res, next) {
  //actually use logic to get user's key here
  var lti_user_private_key = 'Y2Ntcy1kZW1vOmVjYTZkYzVkNmRlNmYwMDc2MWFjOGJkZjAwMTE2NTA4M2RhNjMxZjE=';
  var data = {

  }
  equ.commitChanges(data, lti_user_private_key)
})

router.get('/github', function (req, res, next) {
  var equellaUrl = req.session.equellaUrl;
  if (equellaUrl === null) {
    createPage(req.session.name)
  } else {
    console.log("here")
    var itemId = equellaUrl.split('/')[5]
    var version = equellaUrl.split('/')[6]
    var attachmentId = equellaUrl.split('=')[1]
    equ.getAttachment(itemId, attachmentId, version, function (attachment) {
      req.session.fileName = attachment.description;
      var uriName = encodeURI(req.session.fileName)
      request('https://api.github.com/repos/byuitechops/content_editor_v2/contents/' + uriName, function (err, value) {
        console.log(value)
        req.session.fileName = value.name;
        req.session.file_sha = value.sha;
        req.session.file_path = value.path;
        request(value.download_url, function (err, result, body) {
          if (result.statusCode == 404) {
            createPage(uriName)
          } else {
            res.json({
              title: value.name,
              document: body
            })
          }
        })
      })
    })
  }

  function createPage(name) {
    console.log("Creating Page: ", name)
  }
})

module.exports = router;



/*//Create item in GitHub
  function createPage(fileName) {
    // When implementing LTI piece you can have the user's private key assigned here:
    // NOTE: This is the Base-64 version of the user's private key
    // You MUST Base-64 encode the (user_id?) obtained via the LTI, you can use 'btoa([private key to encode])'
    lti_user_private_key = 'Y2Ntcy1kZW1vOmVjYTZkYzVkNmRlNmYwMDc2MWFjOGJkZjAwMTE2NTA4M2RhNjMxZjE=';
    var document = getEquellaContent(equellaUrl)
    var docDom = parser.parseFromString(document, "text/html");
    docDom.querySelector('head').insertAdjacentHTML('beforeend', '<meta name="equella-url" data-url="' + equellaUrl + '">')
    console.log(serializer.serializeToString(docDom))
    var encoded_file_content = btoa(serializer.serializeToString(docDom));
    var commitMsg = "Item Created"

    // AJAX data must be a JSON string, so assigning to a variable to take care of that later
    var data = {
      "path": fileName,
      "message": commitMsg,
      "content": encoded_file_content
    };
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.github.com/repos/byuitechops/content_editor_v2/contents/" + fileName,
      "method": "PUT",
      "headers": {
        "authorization": "Basic " + lti_user_private_key
      },
      "data": JSON.stringify(data)
    }

    $.ajax(settings).done(function (response) {}).fail(function (error) {
      showToast(false);
      console.log("Creating File Failed: ", error.responseJSON);
    }).done(function (value) {
      file_sha = value.content.sha;
      file_path = value.content.path;
      fileName = value.content.name;

      // Update title of page with fileName
      $('#fileName_title').html(fileName);
      // Set tinymce content to that of the file
      tinymce.activeEditor.setContent(document);
    });
  }
  
  //Commit Changes
      // When implementing LTI piece you can have the user's private key assigned here:
    // NOTE: This is the Base-64 version of the user's private key
    // You MUST Base-64 encode the (user_id?) obtained via the LTI, you can use 'btoa([private key to encode])'
    lti_user_private_key = 'Y2Ntcy1kZW1vOmVjYTZkYzVkNmRlNmYwMDc2MWFjOGJkZjAwMTE2NTA4M2RhNjMxZjE=';

    var encoded_file_content = btoa(tinymce.activeEditor.getContent());
    var commitMsg = $('#commitMsg').val();

    // AJAX data must be a JSON string, so assigning to a variable to take care of that later
    var data = {
      "path": file_path,
      "sha": file_sha,
      "message": commitMsg,
      "content": encoded_file_content
    };
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.github.com/repos/byuitechops/content_editor_v2/contents/" + file_path,
      "method": "PUT",
      "headers": {
        "authorization": "Basic " + lti_user_private_key
      },
      "data": JSON.stringify(data)
    }

    $.ajax(settings).done(function (response) {
      console.log(response);
    }).fail(function (error) {
      showToast(false);
      console.log("Commiting File Failed: ", error.responseJSON);
    }).done(function (result) {

      console.log('Successfully Commited: ', result);
      showToast(true);
    });
*/
