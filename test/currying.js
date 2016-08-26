const tape = require('tape'), mews = require('../lib')
const path = require('path'), fs = require('fs'), util = require('util')

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

  let fn = (d, a, b, c) => {
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
  mews('__test__', fn)

  let mew = mews.__test__
  args.forEach(arg => mew = mew(arg))
  mew = mew(...format)
  mew = mew(...format2)
  delete mews.__test__
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

  let fn = (d, a, b, c) => {
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
  mews('__test__', fn)

  let mew = mews.__test__(args[0])
  t.isNot(mew, mew = mew()(), "curry generates new functions")
  mew = mew(args[1])
  t.isNot(mew, mew = mew(), "curry generates new functions")
  mew = mew(args[2], ...format)
  t.isNot(mew, mew = mew(), "curry generates new functions")
  mew = mew(...format2)
  t.isNot(mew, mew = mew(), "curry generates new functions")
  delete mews.__test__

  t.end()
})

tape('curry blending', t => {
  let expected = [`mew ${Math.random()} mew`, Symbol('1a'), Symbol('1b')]
  let mew = []
  let actual = []
  let fn = (str, a, b) => actual = [str, a, b]

  mews('__test__', fn)

  mew[0] = mews.__test__()()()
  mew[1] = mew[0](expected[1])
  mew[2] = mew[1](expected[2])
  mew[3] = mew[2](expected[0])
  t.same(actual, expected, 'first curry is good')

  let expected2 = expected.slice()
  let mew2 = mew.slice()
  expected2[2] = Symbol('2b')
  expected2[0] = `nya ${Math.random()} nya`
  mew2[2] = mew2[1](expected2[2])
  mew2[3] = mew2[2](expected2[0])
  t.same(actual, expected2, 'second curry is good')

  expected[0] = `kya ${Math.random()} kya`
  mew[3] = mew[2](expected[0])
  t.same(actual, expected, 'reuse first curry')

  expected2[0] = `uwa ${Math.random()} uwa`
  mew2[3] = mew2[2](expected2[0])
  t.same(actual, expected2, 'reuse second curry')

  let expected3 = [`pyo ${Math.random()} pyo`, Symbol('3a'), Symbol('3b')]
  let mew3 = [mew2[0]]
  mew3[1] = mew3[0](expected3[1])
  mew3[2] = mew3[1](expected3[2])
  mew3[3] = mew3[2](expected3[0])
  t.same(actual, expected3, 'third curry is good')

  expected[0] = `wah ${Math.random()} wah`
  mew[3] = mew[2](expected[0])
  t.same(actual, expected, 'reuse first curry')

  expected2[2] = Symbol('2.2b')
  expected2[0] = `ehh ${Math.random()} ehh`
  mew2[2] = mew2[1](expected2[2])
  mew2[3] = mew2[2](expected2[0])
  t.same(actual, expected2, 'reuse second curry')

  expected3[0] = `weh ${Math.random()} weh`
  mew3[3] = mew3[2](expected3[0])
  t.same(actual, expected3, 'reuse third curry')

  delete mews.__test__
  t.end()
})
