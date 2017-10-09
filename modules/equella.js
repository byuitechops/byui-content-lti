/*eslint-env node*/
var https = require('https')
var auth
var request = require('request')
/*check for global auth, else load it from the disk*/
if (!process.env.access_token) {
  auth = require('../auth.json')
} else {
  auth = {
    access_token: process.env.access_token
  }
}

function getAttachment(itemId, attachmentId, version, callback) {
  var headers = {
    "X-Authorization": "access_token=" + auth.access_token
  }
  var options = {
    hostname: 'byuidev.equella.ecollege.com',
    port: 443,
    path: '/original/api/item/' + itemId + '/' + version,
    method: 'GET',
    headers: headers
  }

  var data = "",
    attachment
  var secReq = https.request(options, function (response) {
    response.on('data', function (chunk) {
      data += chunk
    })
    response.on('end', function () {
      var parsed = JSON.parse(data)
      attachment = parsed.attachments.filter(function (each) {
        return each.uuid === attachmentId
      })[0]
      callback(attachment)
    })
  })
  secReq.end();
}


module.exports = {
  getAttachment: getAttachment
}
