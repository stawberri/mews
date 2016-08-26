const fs = require('fs'), path = require('path'), util = require('util')
let configurable = true, enumerable = true

exports = module.exports = (name, fn) => {
  let mew = () => {
    if(typeof fn !== 'function') fn = require(fn)
    if(typeof fn !== 'function') throw Error(`required file "${name}" doesn't export a function`)
    if(fn.length < 1) throw Error(`function "${name}" must specify at least one parameter`)

    let target = fn.length - 1, props = {}, templateProps = {}, properties = () => ({})
    if(typeof fn.properties === 'object') {
      for(let key in fn.properties) {
        let value = fn.properties[key], writable = true, wasObject = false
        if(typeof value === 'object' && (value.value || value.writable)) {
          wasObject = true
          ~({value, writable} = value)
        }
        let property = templateProps[key] = {}

        switch(typeof value) {
          case 'undefined':
            props[key] = undefined
            property.get = opts => {}
            property.set = opts => () => {}
          break

          case 'boolean':
            props[key] = value
            property.get = opts => opts[key] = !opts[key]
            property.set = opts => arg => opts[key] = !!arg
          break

          case 'number':
            props[key] = value
            property.get = opts => opts[key] = value
            property.set = opts => arg => opts[key] = Number(arg)
          break

          case 'string':
            props[key] = value
            property.get = opts => opts[key] = value
            property.set = opts => arg => opts[key] = String(arg)
          break

          case 'symbol':
            props[key] = value
            property.get = opts => opts[key] = value
            property.set = opts => arg => opts[key] = typeof arg === 'symbol' ? arg : Symbol(arg)
          break

          case 'function':
            if(wasObject) throw Error(`parameter ${key} can't be a function`)
            property.get = opts => value.call(opts)
            property.set = opts => () => {}
          break

          case 'object':
            if(wasObject) throw Error(`parameter ${key} can't be an object`)

            if(value.get) property.get = opts => value.get.call(opts)
            else property.get = opts => {}
            if(value.set) property.set = opts => (...arg) => value.set.call(opts, ...arg)
            else property.set = opts => () => {}
          break

          default: throw Error(`parameter ${key} was an unexpected type`)
        }

        if(!writable) property.set = opts => arg => {}
      }
      properties = (opts, curry) => {
        let propObject = {}
        for(let key in templateProps) {
          let value = templateProps[key]

          propObject[key] = {
            enumerable,
            get: () => {
              opts = Object.assign({}, opts)
              value.get(opts)
              return curry(opts)
            },
            set: (...args) => value.set(opts)(...args)
          }
        }
        return propObject
      }
    }

    let getter = (getterProp = props, ...getterArgs) => {
      getterProp = Object.assign({}, getterProp)

      if(getterArgs.length === target) {
        curry = (...format) => {
          fn.call(Object.assign({}, getterProp), util.format(...format), ...getterArgs)
          return getter(getterProp, ...getterArgs)
        }
      } else {
        curry = (...args) => {
          let myArgs = getterArgs.concat(args.splice(0, target - getterArgs.length))
          if(args.length) return getter(getterProp, ...myArgs)(...args)
          return getter(getterProp, ...myArgs)
        }
      }
      Object.defineProperties(curry, properties(getterProp, newProp => getter(newProp, ...getterArgs)))
      return curry
    }

    let setter = () => {}
    if(typeof fn.setter === 'function') {
      setter = (...args) => fn.setter.call(Object.assign({}, props), ...args)
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
