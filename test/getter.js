const tape = require('tape'), mew = require('../lib')
const path = require('path'), fs = require('fs'), util = require('util')

tape('mew is a function', t => {
  t.is(typeof mew, 'function', 'typeof mew')
  t.end()
})

tape('uses functions', t => {
  t.plan(3)

  let randomString = `Meow Meow ${Math.random()} Nyaa Nyaa`
  let fn = str => t.is(str, randomString, 'string equivalence')

  mew('__test__', fn)
  mew.__test__(randomString)

  t.doesNotThrow(() => {
    delete mew.__test__
    t.is(mew.__test__, undefined, 'property deleted')
  }, 'deleting property')
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
  mew('__test__', filename)

  t.doesNotThrow(() => {
    mew.__test__(randomString)
  }, 'correct argument')

  t.throws(() => {
    mew.__test__(wrongString)
  }, 'incorrect argument')

  delete mew.__test__

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
  mew('__test__', fn)
  mew.__test__(...args)
  delete mew.__test__
  t.end()
})

tape('does not require until called', t => {
  let filename = path.join(__dirname, '__test__error.js')
  let fileData = "throw new Error('not implemented')"

  fs.writeFileSync(filename, fileData)

  t.doesNotThrow(() => {
    mew('__test__', filename)
  }, 'add to mew')

  t.throws(() => {
    mew.__test__()
  }, 'call function')

  delete mew.__test__

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
  mew('__test__', fn)
  t.isNot(mew.__test__, mew.__test__, 'equivalence')
  delete mew.__test__
  t.end()
})
