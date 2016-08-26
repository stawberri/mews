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

let paramChecker = (t, actual, expected, msg) => {
  for(let key in expected) {
    t.is(actual[key], expected[key], `${msg} equivalence: ${key}`)
  }

  for(let key in actual) {
    t.is(actual[key], expected[key], `${msg} extraneousness: ${key}`)
  }
}

let copy = obj => Array.isArray(obj) ? obj.slice() : Object.assign({}, obj)

tape('properties are kept if they are never changed', t => {
  let expected = {
    t: true,
    f: false,
    string: '',
    symbol: Symbol(),
    num: 0,
    undef: undefined
  }
  let fn = function(a, b, c) { paramChecker(t, this, expected, `function call: ${a}`) }
  fn.setter = function(a) { paramChecker(t, this, expected, `setter: ${a}`) }
  fn.properties = copy(expected)

  mew('__test__', fn)

  let curry = mew.__test__(1)
  curry = curry(2)
  curry = curry(3)

  mew.__test__ = 1

  curry = curry(4)

  delete mew.__test__
  t.end()
})

tape('properties can change', t => {
  let original = {
    t: true,
    f: false,
    string: '',
    symbol: Symbol(),
    num: 0,
    undef: undefined
  }

  let fn = function(a, b, c) { paramChecker(t, this, expected, `function call: ${a}`) }
  fn.setter = function(a) { paramChecker(t, this, expected, `setter: ${a}`) }
  fn.properties = copy(original)

  mew('__test__', fn)

  let expected = copy(original)
  let curry = []
  curry[0] = mew.__test__.f
  expected.f = !expected.f
  ;(curry[1] = curry[0](0)).string = Symbol('meow')
  expected.string = String(Symbol('meow'))
  ;(curry[2] = curry[1](1)).num = '16'
  expected.num = Number('16')
  ;(curry[3] = curry[2](2)).undef = 28 // enough parameters
  let testSymbol = Symbol('nyaa')
  ;(curry[4] = curry[3](3)).symbol = testSymbol
  expected.symbol = testSymbol
  let expected4 = copy(expected)
  ;(curry[5] = curry[4](4)).t = 'uwah'
  curry[6] = curry[5](5).symbol
  expected.symbol = original.symbol
  curry[7] = curry[6](6)
  let expected7 = copy(expected)

  expected = copy(original)
  mew.__test__ = 'originals'

  expected = copy(expected4)
  curry[5] = curry[4]('4b').num
  expected.num = original.num
  curry[6] = curry[5]('5b')

  expected = copy(expected7)
  curry[8] = curry[7]('7c').t
  expected.t = !expected.t
  curry[9] = curry[8]('8c').string
  expected.string = original.string
  curry[9]('9c')

  delete mew.__test__
  t.end()
})

tape('getters and setters', t => {
  let expected = {
    a: Symbol('get a'),
    b: Symbol('get b'),
    c: Symbol('get c'),
    d: Symbol('get d'),
    e: Symbol('get e'),
    f: Symbol('get f'),
    s: Symbol('set s'),
    t: Symbol('set t'),
  }

  let fn = function(a, b, c, d, e) { paramChecker(t, this, expected, `function call: ${a}`) }
  fn.setter = function(a) { paramChecker(t, this, expected, `setter: ${a}`) }
  fn.properties = {
    getTest() {
      this.a = expected.a
      this.b = expected.b
    },
    objTest: {
      get() {
        this.c = expected.c
        this.d = expected.d
      }
    },
    setTest: {
      set(arg) {
        this.s = arg
      }
    },
    bothTest: {
      get() {
        this.e = expected.e
        this.f = expected.f
      },
      set(arg) {
        this.t = arg
      }
    }
  }

  mew('__test__', fn)

  let curry = mew.__test__(1)
  curry.getTest = Symbol('get')
  curry = curry.getTest(2)
  curry.objTest = Symbol('obj')
  curry = curry.objTest(3)
  curry.setTest = expected.s
  curry = curry.setTest(4)
  curry.bothTest = expected.t
  curry = curry.bothTest(5)
  curry('a')

  expected = {}
  mew.__test__('b', 1, 2, 3, 4)
  mew.__test__ = 'c'

  delete mew.__test__
  t.end()
})
