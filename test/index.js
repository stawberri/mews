const tape = require('tape'), path = require('path'), fs = require('fs')
const util = require('util')
const mew = require('../lib')

tape('mew is a function', t => {
  t.is(typeof mew, 'function', 'typeof mew')
  t.end()
})

tape('uses functions', t => {
  t.plan(3)

  let randomString = `Meow Meow ${Math.random()} Nyaa Nyaa`
  let fn = (str, opts) => t.is(str, randomString, 'string equivalence')

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
    module.exports = (str, opts) => {
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
  let fn = (d, opts, a, b, c) => {
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

tape('currying', t => {
  t.plan(10)

  let times = 0
  let args = [
    Symbol('first'),
    Symbol('second'),
    Symbol('third'),
  ]
  let format = [
    `weh %s %s %s weh`, 'meow', Math.random(), 'nyaa'
  ]
  let formatted = util.format(...format)

  let format2 = [
    `kya %s %s %s kya`, 'nyaa', Math.random(), 'meow'
  ]
  let formatted2 = util.format(...format2)

  let fn = (d, opts, a, b, c) => {
    switch(++times) {
      case 1:
        t.is(d, formatted, 'string argument 1')
        t.pass('first time')
      break;

      case 2:
        t.is(d, formatted2, 'string argument 2')
        t.pass('second time')
      break;

      default:
        t.fail('function ran too many times')
    }
    t.is(a, args[0], 'first argument')
    t.is(b, args[1], 'second argument')
    t.is(c, args[2], 'third argument')
  }
  mew('__test__', fn)

  let curry = mew.__test__
  args.forEach(arg => curry = curry(arg))
  curry = curry(...format)
  curry = curry(...format2)
  delete mew.__test__
})

tape('currying edge cases', t => {
  let times = 0
  let args = [
    Symbol('first'),
    Symbol('second'),
    Symbol('third'),
  ]
  let format = [
    `weh %s ${Math.random()} %s weh`, 'meow', 'nyaa'
  ]
  let formatted = util.format(...format)

  let format2 = [
    `kya %s ${Math.random()} %s kya`, 'nyaa', 'meow'
  ]
  let formatted2 = util.format(...format2)

  let fn = (d, opts, a, b, c) => {
    switch(++times) {
      case 1:
        t.is(d, formatted, 'string argument 1')
        t.pass('first time')
      break;

      case 2:
        t.is(d, '', 'blank call 1')
        t.pass('second time')
      break;

      case 3:
        t.is(d, formatted2, 'string argument 2')
        t.pass('third time')
      break;

      case 4:
        t.is(d, '', 'blank call 2')
        t.pass('fourth time')
      break;

      default:
        t.fail('function ran too many times')
    }
    t.is(a, args[0], 'first argument')
    t.is(b, args[1], 'second argument')
    t.is(c, args[2], 'third argument')
  }
  mew('__test__', fn)

  let curry = mew.__test__(args[0])
  t.isNot(curry, curry = curry()(), "curry generates new functions")
  curry = curry(args[1])
  t.isNot(curry, curry = curry(), "curry generates new functions")
  curry = curry(args[2], ...format)
  t.isNot(curry, curry = curry(), "curry generates new functions")
  curry = curry(...format2)
  t.isNot(curry, curry = curry(), "curry generates new functions")
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

tape('curry blending', t => {
  let expected = [`mew ${Math.random()} mew`, Symbol('1a'), Symbol('1b')]
  let curries = []
  let actual = []
  let fn = (str, opts, a, b) => actual = [str, a, b]

  mew('__test__', fn)

  curries[0] = mew.__test__()()()
  curries[1] = curries[0](expected[1])
  curries[2] = curries[1](expected[2])
  curries[3] = curries[2](expected[0])
  t.same(actual, expected, 'first curry is good')

  let expected2 = expected.slice()
  let curries2 = curries.slice()
  expected2[2] = Symbol('2b')
  expected2[0] = `nya ${Math.random()} nya`
  curries2[2] = curries2[1](expected2[2])
  curries2[3] = curries2[2](expected2[0])
  t.same(actual, expected2, 'second curry is good')

  expected[0] = `kya ${Math.random()} kya`
  curries[3] = curries[2](expected[0])
  t.same(actual, expected, 'reuse first curry')

  expected2[0] = `uwa ${Math.random()} uwa`
  curries2[3] = curries2[2](expected2[0])
  t.same(actual, expected2, 'reuse second curry')

  let expected3 = [`pyo ${Math.random()} pyo`, Symbol('3a'), Symbol('3b')]
  let curries3 = [curries2[0]]
  curries3[1] = curries3[0](expected3[1])
  curries3[2] = curries3[1](expected3[2])
  curries3[3] = curries3[2](expected3[0])
  t.same(actual, expected3, 'third curry is good')

  expected[0] = `wah ${Math.random()} wah`
  curries[3] = curries[2](expected[0])
  t.same(actual, expected, 'reuse first curry')

  expected2[2] = Symbol('2.2b')
  expected2[0] = `ehh ${Math.random()} ehh`
  curries2[2] = curries2[1](expected2[2])
  curries2[3] = curries2[2](expected2[0])
  t.same(actual, expected2, 'reuse second curry')

  expected3[0] = `weh ${Math.random()} weh`
  curries3[3] = curries3[2](expected3[0])
  t.same(actual, expected3, 'reuse third curry')

  delete mew.__test__
  t.end()
})

tape('each instance is different', t => {
  let fn = (a, b) => {}
  mew('__test__', fn)
  t.isNot(mew.__test__, mew.__test__, 'equivalence')
  delete mew.__test__
  t.end()
})

tape('lib files', t => {
  let foundIndex = false
  let lib = path.resolve(__dirname, '../lib')
  fs
    .readdirSync(lib)
    .forEach(file => {
      if(file === 'index.js') return foundIndex = true

      let match = /^(.*)\.js$/.exec(file)
      if(!match || !match[1]) return
      let prop = match[1]

      t.test(`lib files: ${prop}`, t => {
        t.doesNotThrow(() => {
          t.is(typeof require(path.join(lib, file)), 'function', 'file exports a function')
          t.is(typeof mew[prop], 'function', 'property is a function')
        }, `file implementation`)

        t.end()
      })
    })
  t.ok(foundIndex, 'index.js found')
  t.is(mew.index, undefined, 'index is not a property')
  t.end()
})
