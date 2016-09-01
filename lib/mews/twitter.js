const request = require('request')

exports = module.exports = function(
  status,
  consumer_key, consumer_secret,
  token, token_secret
) {
  let oauth = {consumer_key, consumer_secret, token, token_secret}
  let {possibly_sensitive, in_reply_to_status_id, dm} = this

  possibly_sensitive = +possibly_sensitive

  if(dm.length) {
    let form = {text: status}
    if(~dm.search(/\D/)) {
      form.screen_name = dm.replace(/^@/, '')
    } else {
      form.user_id = dm
    }
    request.post('https://api.twitter.com/1.1/direct_messages/new.json', {
      oauth, form
    })
  } else {
    request.post('https://api.twitter.com/1.1/statuses/update.json', {
      oauth,
      form: {status, possibly_sensitive, in_reply_to_status_id}
    })
  }
}

exports.properties = {
  possibly_sensitive: false,
  sensitive() {this.possibly_sensitive = !this.possibly_sensitive},

  in_reply_to_status_id: '',
  replyTo: {
    get() {this.in_reply_to_status_id = ''},
    set(val) {this.in_reply_to_status_id = val}
  },

  dm: ''
}
