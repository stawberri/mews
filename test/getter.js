const tape = require('tape'), mews = require('../lib')
const path = require('path'), fs = require('fs'), util = require('util')

tape('mews is a function', t => {
  t.is(typeof mews, 'function', 'typeof mews')
  t.end()
})

tape('uses functions', t => {
  t.plan(3)

  let randomString = `Meow Meow ${Math.random()} Nyaa Nyaa`
  let fn = str => t.is(str, randomString, 'string equivalence')

  mews('__test__', fn)
  mews.__test__(randomString)

  t.doesNotThrow(() => {
    delete mews.__test__
    t.is(mews.__test__, undefined, 'property deleted')
  }, 'deleting property')
})

tape('requires a parameter', t => {
  let fn = () => {}
  mews('__test__', fn)

  t.throws(() => {
    mews.__test__
  }, 'run function with no parameter')

  delete mews.__test__

  t.end()
})

tape('requires non-functions', t => {
  let filename = path.join(__dirname, '__test__require.js')
  let randomString = `Meow Meow ${Math.random()} Nyaa Nyaa`
  let wrongString = `Nyaa Nyaa ${Math.random()} Meow Meow`
  let fileData = `
    module.exports = str => {
      if(str !== '${randomString}')
        throw new Error(\`expected: ${randomString}, actual: \${str}\`)
    }
  `.replace(/^ {4}/mg, '')

  fs.writeFileSync(filename, fileData)
  mews('__test__', filename)

  t.doesNotThrow(() => {
    mews.__test__(randomString)
  }, 'correct argument')

  t.throws(() => {
    mews.__test__(wrongString)
  }, 'incorrect argument')

  delete mews.__test__

  t.doesNotThrow(() => {
    try {
      fs.unlinkSync(filename)
    } catch(e) {
      if(e.code !== 'ENOENT') throw String(e)
    }
  }, 'deleting file')

  t.end()
})

tape('requires an export of a function', t => {
  let filename = path.join(__dirname, '__test__function.js')

  let fileData = `
    module.exports = {}
  `.replace(/^ {4}/mg, '')

  fs.writeFileSync(filename, fileData)
  mews('__test__', filename)

  t.throws(() => {
    mews.__test__
  }, 'access non function')

  delete mews.__test__

  t.doesNotThrow(() => {
    try {
      fs.unlinkSync(filename)
    } catch(e) {
      if(e.code !== 'ENOENT') throw String(e)
    }
  }, 'deleting file')

  t.end()
})

tape('formatted argument first', t => {
  let args = [
    Symbol('first'),
    Symbol('second'),
    Symbol('third'),
    `weh %s %s %s weh`, 'meow', Math.random(), 'nyaa'
  ]
  let formatted = util.format(...args.slice(3))
  let fn = (d, a, b, c) => {
    t.is(d, formatted, 'formatted argument')
    t.is(a, args[0], 'first argument')
    t.is(b, args[1], 'second argument')
    t.is(c, args[2], 'third argument')
  }
  mews('__test__', fn)
  mews.__test__(...args)
  delete mews.__test__
  t.end()
})

tape('does not require until called', t => {
  let filename = path.join(__dirname, '__test__error.js')
  let fileData = "throw new Error('not implemented')"

  fs.writeFileSync(filename, fileData)

  t.doesNotThrow(() => {
    mews('__test__', filename)
  }, 'add to mews')

  t.throws(() => {
    mews.__test__()
  }, 'call function')

  delete mews.__test__

  t.doesNotThrow(() => {
    try {
      fs.unlinkSync(filename)
    } catch(e) {
      if(e.code !== 'ENOENT') throw String(e)
    }
  }, 'deleting file')

  t.end()
})

tape('each instance is different', t => {
  let fn = (a, b) => {}
  mews('__test__', fn)
  t.isNot(mews.__test__, mews.__test__, 'equivalence')
  delete mews.__test__
  t.end()
})
