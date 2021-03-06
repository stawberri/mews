const fs = require('fs'), path = require('path'), util = require('util')
let configurable = true, enumerable = true

exports = module.exports = (name, fn) => {
  let mews = () => {
    if(typeof fn !== 'function') fn = require(fn)
    if(typeof fn !== 'function') throw new Error(`required file "${name}" doesn't export a function`)
    if(fn.length < 1) throw new Error(`function "${name}" must specify at least one parameter`)

    let target = fn.length - 1, props = {}, templateProps = {}, properties = () => ({})
    if(typeof fn.properties === 'object') {
      for(let key in fn.properties) {
        let value = fn.properties[key], writable = true, wasObject = false
        if(typeof value === 'object') {
          if(value.value !== undefined || value.writable !== undefined ) {
            wasObject = true
            ~({value = undefined, writable = false} = value)
          }
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
            property.set = opts => arg => opts[key] = +arg
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
            if(wasObject) throw new Error(`parameter ${key} can't be a function`)
            property.get = opts => value.call(opts)
            property.set = opts => () => {}
          break

          case 'object':
            if(wasObject) throw new Error(`parameter ${key} can't be an object`)

            if(value.get) property.get = opts => value.get.call(opts)
            else property.get = opts => {}
            if(value.set) property.set = opts => (...arg) => value.set.call(opts, ...arg)
            else property.set = opts => () => {}
          break

          default: throw new Error(`parameter ${key} was an unexpected type`)
        }

        if(!writable) {
          property.get = opts => {}
          property.set = opts => () => {}
        }
      }
      properties = (opts, curry) => {
        let propObject = {}
        for(let key in templateProps) {
          let value = templateProps[key]

          propObject[key] = {
            enumerable,
            get: () => {
              let newOpts = Object.assign({}, opts)
              value.get(newOpts)
              return curry(newOpts)
            },
            set: (...args) => value.set(opts)(...args)
          }
        }
        return propObject
      }
    }

    let getter = (getterProp = props, ...getterArgs) => {
      let mew
      getterProp = Object.assign({}, getterProp)

      if(getterArgs.length === target) {
        mew = (...format) => {
          fn.call(Object.assign({}, getterProp), util.format(...format), ...getterArgs)
          return getter(getterProp, ...getterArgs)
        }
        Object.defineProperty(mew, 'name', {value: `${name} mew`})
      } else {
        mew = (...args) => {
          let myArgs = getterArgs.concat(args.splice(0, target - getterArgs.length))
          if(args.length) return getter(getterProp, ...myArgs)(...args)
          return getter(getterProp, ...myArgs)
        }
        Object.defineProperty(mew, 'name', {value: `incomplete ${name} mew`})
      }
      Object.defineProperties(mew, properties(getterProp, newProp => getter(newProp, ...getterArgs)))
      return mew
    }

    let setter = () => {}
    if(typeof fn.setter === 'function') {
      setter = (...args) => fn.setter.call(Object.assign({}, props), ...args)
    }

    mews = () => ({getter, setter})
    return mews()
  }

  Object.defineProperty(exports, name, {
    configurable, enumerable,
    get: () => mews().getter(),
    set: (...args) => mews().setter(...args)
  })
}

Object.defineProperty(exports, 'name', {value: 'mews'})

fs
  .readdirSync(path.join(__dirname, 'mews'))
  .forEach(file => {
    file = /^(.*)\.js$/.exec(file)[1]
    exports(file, path.join(__dirname, 'mews', file))
  })
