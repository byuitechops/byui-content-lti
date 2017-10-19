/*eslint-env browser, jquery*/
function search() {
  $('#searchResults').html("")
  $('#searchResults').toggleClass('hidden')
  var query = $('#search').val()

  $.get('/api/searchContent/?q=' + encodeURIComponent(query), function (response) {
    logResults(response, 'searchResults')
  })
}

$.get('/api/getCourseContent/?courseId=' + encodeURIComponent(courseId), function (response) {
  logResults(response, 'courseContent')
})

function logResults(response, ele) {
  var reduced = response.results.filter(function (result) {
    return typeof (result.attachments) != 'undefined'
  })
  reduced.forEach(function (item) {
    console.log(item)
    var html = '<p class="collection-item active blue accent-4">' + item.name + '</p>'
    document.getElementById(ele).insertAdjacentHTML('beforeend', html)
    item.attachments.forEach(function (attachment) {
      var html = '<a href="https://byui.instructure.com/courses/142/external_content/success/external_tool_dialog?return_type=lti_launch_url&url=https%3A%2F%2Flocalhost%3A1830%2Flti%2Fcontent%2F%3Furl=' + escape(encodeURIComponent(attachment.links.view)) + '&title=' + attachment.description + '" class="collection-item blue-text text-accent-4">' + attachment.description + '</a>'
      document.getElementById(ele).insertAdjacentHTML('beforeend', html)
    })
  })
}

function showAddPage() {
  $('#createDocument').toggleClass('hidden');
}

function createPage() {
  $.post('/api/content/?file_name=' + $('#title').val()).done(function (response) {
    console.log("redirecting to: ", response.url)
    window.location = response.url
  })
}
