/*eslint-env node*/
//var serializer = require("xmlserializer");
var btoa = require('btoa');
var request = require('request');

function createPage(fileName, document, callback) {
  // When implementing LTI piece you can have the user's private key assigned here:
  // NOTE: This is the Base-64 version of the user's private key
  // You MUST Base-64 encode the (user_id?) obtained via the LTI, you can use 'btoa([private key to encode])'
  var lti_user_private_key = getLtiKey();
  //  var document = getEquellaContent(equellaUrl)
  //  console.log(serializer.serializeToString(docDom))
  //    docDom.querySelector('head').insertAdjacentHTML('beforeend', '<meta name="equella-url" data-url="' + equellaUrl + '">')
  //  var docDom = parser.parseFromString(document, "text/html");
  var encoded_file_content = btoa(document);
  var commitMsg = "Item Created"

  // AJAX data must be a JSON string, so assigning to a variable to take care of that later
  var data = {
    "path": fileName,
    "message": commitMsg,
    "content": encoded_file_content
  };
  var url = "https://api.github.com/repos/byuitechops/content_editor_v2/contents/" + fileName;
  var settings = {
    "crossDomain": true,
    "url": url,
    "method": "PUT",
    "headers": {
      "authorization": "Basic " + lti_user_private_key,
      "User-Agent": "LTIBrain"
    },
    "json": true,
    "body": data
  }
  request(settings, function (err, data, body) {
    if (err) {
      console.log("Creating File Failed: ", error.responseJSON);
    } else {
      callback(body.content)
    }
  })
}

function getLtiKey() {
  return 'Y2Ntcy1kZW1vOmVjYTZkYzVkNmRlNmYwMDc2MWFjOGJkZjAwMTE2NTA4M2RhNjMxZjE=';
}

module.exports = {
  createPage: createPage
}
