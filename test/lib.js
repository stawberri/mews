const tape = require('tape'), mew = require('../lib')
const path = require('path'), fs = require('fs')

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
