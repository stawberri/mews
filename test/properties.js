const tape = require('tape'), mew = require('../lib')

tape('setter works', t => {
  t.plan(1)
  let expected = Symbol()
  let fn = a => {}
  fn.setter = actual => t.is(actual, expected, 'equivalence')
  mew('__test__', fn)
  mew.__test__ = expected
  delete mew.__test__
})
