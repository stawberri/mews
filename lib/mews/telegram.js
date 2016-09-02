const request = require('request')

exports = module.exports = function(text, token, chat_id) {
  let match = /(?:bot)?(\d+:[-\w]+)/.exec(token)
  if(match) token = match[1]

  let {
    parse_mode, disable_web_page_preview,
    disable_notification, reply_markup
  } = this

  disable_web_page_preview = +disable_web_page_preview
  disable_notification = +disable_notification

  request.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    form: {
      chat_id, text, parse_mode, disable_web_page_preview,
      disable_notification, reply_markup
    }
  }, () => {})
}

exports.properties = {
  parse_mode: '',
  markdown() {this.parse_mode = this.parse_mode === 'markdown' ? '' : 'markdown'},
  html() {this.parse_mode = this.parse_mode === 'html' ? '' : 'html'},

  disable_web_page_preview: false,
  noPreview() {this.disable_web_page_preview = !this.disable_web_page_preview},

  disable_notification: false,
  noNotify() {this.disable_notification = !this.disable_notification},

  reply_markup: ''
}
