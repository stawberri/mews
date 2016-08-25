const fs = require('fs'), path = require('path'), util = require('util')
let configurable = true, enumerable = true

exports = module.exports = (prop, fn) => {
  Object.defineProperty(exports, prop, {configurable, enumerable, get() {
    if(typeof prop === 'object') return mew()
    if(typeof fn !== 'function') fn = require(fn)
    if(fn.length < 2) throw new Error('function must specify at least two parameters')
    prop = {}
    return mew()
  }})

  function mew(mewOpts = {}, ...mewArgs) {
    if(mewArgs.length === fn.length - 2) {
      return (...format) => {
        fn(util.format(...format), mewOpts, ...mewArgs)
        return mew(mewOpts, ...mewArgs)
      }
    } else {
      return (...args) => {
        let myArgs = mewArgs.concat(args.splice(0, fn.length - 2 - mewArgs.length))
        if(args.length) return mew(mewOpts, ...myArgs)(...args)
        return mew(mewOpts, ...myArgs)
      }
    }
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
