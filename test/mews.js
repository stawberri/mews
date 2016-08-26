const tape = require('tape'), mews = require('../lib')
const path = require('path'), fs = require('fs')

tape('mewfiles', t => {
  let foundIndex = false
  let mewfiles = path.resolve(__dirname, '../lib/mews')
  fs
    .readdirSync(mewfiles)
    .forEach(mew => {
      let match = /^(.*)\.js$/.exec(mew)
      if(!match || !match[1]) t.fail(`${mew} is not a javascript file`)
      let prop = match[1]

      t.test(`mew: ${prop}`, t => {
        t.is(typeof require(path.join(mewfiles, mew)), 'function', `${prop} exports a function`)
        t.doesNotThrow(() => {
          t.is(typeof mews[prop], 'function', `${prop} is a function`)
        }, `property access`)
        t.end()
      })
    })
  t.end()
})
