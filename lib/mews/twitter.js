const request = require('request')

exports = module.exports = (
  status,
  consumer_key, consumer_secret,
  token, token_secret
) => {
  request.post('https://api.twitter.com/1.1/statuses/update.json', {
    oauth: {consumer_key, consumer_secret, token, token_secret},
    formData: {status}
  })
}
