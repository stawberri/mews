const fs = require('fs'), path = require('path'), util = require('util')
let configurable = true, enumerable = true

exports = module.exports = (prop, fn) => {
  Object.defineProperty(exports, prop, {configurable, enumerable, get() {
    if(typeof prop === 'function') return prop
    if(typeof fn !== 'function') fn = require(fn)
    if(fn.length < 2) throw new Error('function must specify at least two parameters')
    prop = mew()
    return prop
  }})

  function mew(mewOpts = {}, ...mewArgs) {
    let nya
    if(mewArgs.length === fn.length - 2) {
      nya = (...format) => {
        fn(util.format(...format), mewOpts, ...mewArgs)
        return nya
      }
    } else {
      nya = (...args) => {
        let nyaArgs = mewArgs.slice()
        if(!args.length) return nya
        if(nyaArgs.length < fn.length - 2)
          nyaArgs = nyaArgs.concat(args.splice(0, fn.length - nyaArgs.length - 2))
        if(args.length) return mew(mewOpts, ...nyaArgs)(...args)
        return mew(mewOpts, ...nyaArgs)
      }
    }
    return nya
  }
}

fs
  .readdirSync(__dirname)
  .forEach(file => {
    let filename = path.join(__dirname, file)
    if(filename === __filename) return

    let match = /^(.*)\.js$/.exec(file)
    if(!match || !match[1]) return

    exports(match[1], filename)
  })
