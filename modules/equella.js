/*eslint-env node*/
var https = require('https')
var auth
var request = require('request')
var atob = require('atob')
/*check for global auth, else load it from the disk*/
if (!process.env.access_token) {
  auth = require('../auth.json')
} else {
  auth = {
    access_token: process.env.access_token
  }
}
var headers = {
  "X-Authorization": "access_token=" + auth.access_token
}

function getAttachment(equellaUrl, callback) {
  // expects a url with both ids such as https://byuidev.equella.ecollege.com/original/items/5b10c154-7d3d-47b6-865d-1f0644e32070/1/?attachment.uuid=2923a479-9bee-47c8-9683-bf7c250f6409&attachment.stream=true
  var itemId = equellaUrl.split('/')[5]
  var version = equellaUrl.split('/')[6]
  var attachmentId = equellaUrl.split('=')[1]
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

function getContent(url, callback) {
  request.get(url, {
    headers: headers
  }, function (err, data, body) {
    callback(body);
  })
}

function createAttachment(req, fileName, content, callback) {
  //first, create the filearea
  console.log("Creating Attachement: " + fileName)
  request.post('https://byuidev.equella.ecollege.com/original/api/file/', {
    headers: headers,
    json: true
  }, function (err, data, body) {
    if (err) {
      console.log(err)
    }
    var fileAreaId = body.uuid;
    console.log("filearea: ", fileAreaId)
    //then, upload the file to the filearea
    request.put('https://byuidev.equella.ecollege.com/original/api/file/' + fileAreaId + '/content/' + fileName + '.html', {
      "headers": {
        "X-Authorization": "access_token=" + auth.access_token,
        "Content-Type": "text/html",
      },
      "body": content
    }, function (err, data, body) {
      if (err) {
        console.log(err)
      }
      //then, create the item with the filearea id
      console.log("body uploaded?: ", data.statusCode)
      var newUrl = JSON.parse(body).links.content;
      var url = 'https://byuidev.equella.ecollege.com/original/api/item?file=' + fileAreaId + '&draft=false';
      request.post({
        "url": url,
        "headers": headers,
        json: true,
        "body": {
          "name": fileName + ".html",
          "description": fileName,
          "metadata": "<xml><BYUI_extended><byui_rights><restrict_to_byui>BYU-Idaho</restrict_to_byui></byui_rights><attachments><attachment>" + fileAreaId + "</attachment></attachments><BYUI_information><delivery_modes><delivery_mode>Online</delivery_mode></delivery_modes><college_Ids><college_id>Business and Communication</college_id></college_Ids><department_ids><department_id>Business Management</department_id></department_ids><course_names><course_name>BH 101</course_name></course_names></BYUI_information><show_file_browser>owner</show_file_browser></BYUI_extended><MWDL><formats><format>Web page</format></formats><creators><creator/></creators><subjects><subject/></subjects><title>" + fileName + "</title><description>Course Content</description><abstract/></MWDL><item/></xml>",
          "collection": {
            "uuid": "bb348ab1-7a81-4e37-8ef7-adc095ade4f9",
            "name": "BYU-Idaho Faculty Content"
          },
          "attachments": [
            {
              "uuid": fileAreaId,
              "description": fileName,
              "type": "file",
              "filename": fileName + ".html"
              }
            ]
        },
      }, function (err, data, body) {
        var itemId = data.headers.location.split('/')[6]
        console.log("Item created?: ", data.statusCode)
        callback({
          success: true,
          contentUrl: "https://byuidev.equella.ecollege.com/original/items/" + itemId + "/1/?attachment.uuid=" + fileAreaId,
        })
      })
    })
  })
}

function updateAttachment(equellaUrl, content, callback) {
  getAttachment(equellaUrl, function (attachment) {
    request.put('https://byuidev.equella.ecollege.com/original/api/file/' + attachment.uuid + '/content/' + attachment.filename, {
      "headers": {
        "X-Authorization": "access_token=" + auth.access_token,
        "Content-Type": "text/html",
      },
      "body": atob(content.content)
    }, function (err, data, body) {
      console.log(body)
      if (data.statusCode === 200) {
        callback({
          success: true
        })
      } else {
        callback({
          success: false
        })
      }
    })
  })
}

module.exports = {
  getAttachment: getAttachment,
  getContent: getContent,
  createAttachment: createAttachment,
  updateAttachment: updateAttachment
}
