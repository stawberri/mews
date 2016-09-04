const request = require('request')

exports = module.exports = function(text, token, details) {
  let {noParse, link_names, attachments, noPreview} = this
  let form = {text, token, attachments}

  form.link_names = +link_names
  form.parse = noParse ? 'none' : 'full'
  form.unfurl_links = form.unfurl_media = +!noPreview

  if(typeof details === 'string') {
    form.channel = details
  } else {
    if(typeof details.channel === 'string') form.channel = details.channel
    if(typeof details.name === 'string') form.username = details.name
    if(typeof details.icon === 'string') form.icon_url = details.icon
    if(typeof details.emoji === 'string') form.icon_emoji = details.emoji
  }

  if(!(form.username || form.icon_url || form.icon_emoji)) form.as_user = true

  request.post('https://slack.com/api/chat.postMessage', {
    form
  }, () => {})
}

exports.properties = {
  noParse: false,
  link_names: false,
  attachments: '',
  noPreview: false
}
