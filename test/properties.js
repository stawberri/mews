const tape = require('tape'), mew = require('../lib')

tape('setter works', t => {
  t.plan(3)
  let expected = Symbol('1')
  let fn = a => {}
  fn.setter = actual => t.is(actual, expected, 'equivalence')
  mew('__test__', fn)

  mew.__test__ = expected

  expected = Symbol('2')
  mew.__test__ = expected

  expected = Symbol('3')
  mew.__test__ = expected

  delete mew.__test__
})
