exports = module.exports = function(mew) {
  if(this.err) console.error(mew)
  else console.log(mew)
}

exports.properties = {
  err: false,
  error() {this.err = !this.err}
}
