function search() {
  document.getElementById('searchResults').innerHTML = ""
  var query = $('#search').val()

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://localhost:1830/search/' + encodeURIComponent(query))
  xhr.onload = function (e) {
    if (xhr.status == 200) {
      var results = JSON.parse(xhr.response).results
      var reduced = results.filter(function (result) {
        return typeof (result.attachments) != 'undefined'
      })
      console.log(reduced)
      reduced.forEach(function (item) {
        item.attachments.forEach(function (attachment) {
          var html = '<a href="https://byui.instructure.com/courses/142/external_content/success/external_tool_dialog?return_type=lti_launch_url&url=https%3A%2F%2Flocalhost%3A1830%2Fequella%2F' + escape(encodeURIComponent(attachment.links.view)) + '&title=' + attachment.description + '" class="collection-item">' + attachment.description + '</a>'
          document.getElementById('searchResults').insertAdjacentHTML('beforeend', html)
        })
      })
    }
  }
  xhr.send()
}
