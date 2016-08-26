const tape = require('tape'), mew = require('../lib')
const path = require('path'), fs = require('fs')

tape('mews', t => {
  let foundIndex = false
  let mews = path.resolve(__dirname, '../lib/mews')
  fs
    .readdirSync(mews)
    .forEach(file => {
      let match = /^(.*)\.js$/.exec(file)
      if(!match || !match[1]) t.fail(`${file} is not a javascript file`)
      let prop = match[1]

      t.test(`mew: ${prop}`, t => {
        t.is(typeof require(path.join(mews, file)), 'function', `${prop} exports a function`)
        t.doesNotThrow(() => {
          t.is(typeof mew[prop], 'function', `${prop} is a function`)
        }, `property access`)
        t.end()
      })
    })
  t.end()
})
