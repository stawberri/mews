const fs = require('fs'), path = require('path'), util = require('util')
let configurable = true, enumerable = true

exports = module.exports = (name, fn) => {
  let mew = () => {
    if(typeof fn !== 'function') fn = require(fn)
    if(typeof fn !== 'function') throw new Error(`required file "${name}" doesn't export a function`)
    if(fn.length < 1) throw new Error(`function "${name}" must specify at least one parameter`)

    let target = fn.length - 1, props

    let getter = (getterProp = props, ...getterArgs) => {
      if(getterArgs.length === target) {
        return (...format) => {
          if(!getterProp) fn(util.format(...format), ...getterArgs)
          else fn(util.format(...format), getterProp, ...getterArgs)
          return getter(getterProp, ...getterArgs)
        }
      } else {
        return (...args) => {
          let myArgs = getterArgs.concat(args.splice(0, target - getterArgs.length))
          if(args.length) return getter(getterProp, ...myArgs)(...args)
          return getter(getterProp, ...myArgs)
        }
      }
    }

    let setter = () => {}
    if(typeof fn.setter === 'function') {
      setter = (...args) => fn.setter(...args)
    }

    mew = () => ({getter, setter})
    return mew()
  }

  Object.defineProperty(exports, name, {
    configurable, enumerable,
    get: () => mew().getter(),
    set: (...args) => mew().setter(...args)
  })
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
