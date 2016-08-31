const request = require('request')

exports = module.exports = (
  status,
  consumer_key, consumer_secret,
  token, token_secret
) => {
  let {possibly_sensitive} = this

  possibly_sensitive = +possibly_sensitive

  request.post('https://api.twitter.com/1.1/statuses/update.json', {
    oauth: {consumer_key, consumer_secret, token, token_secret},
    formData: {status, possibly_sensitive}
  })
}

exports.properties = {
  possibly_sensitive: false,
  sensitive() {this.possibly_sensitive = !this.possibly_sensitive}
}
