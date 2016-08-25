const https = require('https')

let hostname = 'api.telegram.org', method = 'POST'
let headers = {'Content-Type': 'application/json'}

exports = module.exports = (text, opts, token, chat_id) => {
  let match = /(?:bot)?(\d+:[-\w]+)/.exec(token)
  if(match) token = match[1]
  let path = `/bot${token}/sendMessage`
  https
    .request({hostname, method, path, headers})
    .on('error', e => {})
    .end(JSON.stringify({chat_id, text}))
}
