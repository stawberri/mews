const tape = require('tape'), mews = require('../lib')

tape('setter works', t => {
  t.plan(3)
  let expected = Symbol('1')
  let fn = a => {}
  fn.setter = actual => t.is(actual, expected, 'equivalence')
  mews('__test__', fn)

  mews.__test__ = expected

  expected = Symbol('2')
  mews.__test__ = expected

  expected = Symbol('3')
  mews.__test__ = expected

  delete mews.__test__
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

  mews('__test__', fn)

  let mew = mews.__test__(1)
  mew = mew(2)
  mew = mew(3)

  mews.__test__ = 1

  mew = mew(4)

  delete mews.__test__
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
  fn.properties.f = {value: false, writable: true}

  mews('__test__', fn)

  let expected = copy(original)
  let mew = []
  mew[0] = mews.__test__.f
  expected.f = !expected.f
  ;(mew[1] = mew[0](0)).string = Symbol('meow')
  expected.string = String(Symbol('meow'))
  ;(mew[2] = mew[1](1)).num = '16'
  expected.num = Number('16')
  ;(mew[3] = mew[2](2)).undef = 28 // enough parameters
  let testSymbol = Symbol('nyaa')
  ;(mew[4] = mew[3](3)).symbol = testSymbol
  expected.symbol = testSymbol
  let expected4 = copy(expected)
  ;(mew[5] = mew[4](4)).t = 'uwah'
  mew[6] = mew[5](5).symbol
  expected.symbol = original.symbol
  mew[7] = mew[6](6)
  let expected7 = copy(expected)

  expected = copy(original)
  mews.__test__ = 'originals'

  expected = copy(expected4)
  mew[5] = mew[4]('4b').num
  expected.num = original.num
  mew[6] = mew[5]('5b')

  expected = copy(expected7)
  mew[8] = mew[7]('7c').t
  expected.t = !expected.t
  mew[9] = mew[8]('8c').string
  expected.string = original.string
  mew[9]('9c')

  delete mews.__test__
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
    },
    neitherTest: {}
  }

  mews('__test__', fn)

  let mew = mews.__test__(1)
  mew.getTest = Symbol('get')
  mew = mew.getTest(2)
  mew.objTest = Symbol('obj')
  mew = mew.objTest(3)
  mew.setTest = expected.s
  mew = mew.setTest(4)
  mew.bothTest = expected.t
  mew = mew.bothTest(5)
  mew.neitherTest = Symbol('neither')
  mew = mew.neitherTest(6)
  mew('a')

  expected = {}
  mews.__test__('b', 1, 2, 3, 4)
  mews.__test__ = 'c'

  delete mews.__test__
  t.end()
})

tape('object properties', t => {
  fn = ok => {}
  fn.properties = {
    badFn: {
      value() {}
    }
  }
  mews('__test__', fn)
  t.throws(() => {
    mews.__test__
  }, 'function')
  delete mews.__test__

  fn.properties = {
    badObj: {
      value: {}
    }
  }
  mews('__test__', fn)
  t.throws(() => {
    mews.__test__
  }, 'object')
  delete mews.__test__

  let expected = {immutable: true, unchanging: true}
  fn = function(a) { paramChecker(t, this, expected, `function call: ${a}`) }
  fn.properties = {
    immutable: {
      value: true,
      writable: false
    },
    unchanging: {
      value: true,
      writable: false
    }
  }
  mews('__test__', fn)
  let mew = mews.__test__.immutable(1)
  mew.unchanging = false
  mew(2)
  delete mews.__test__

  t.end()
})

tape('function modification scope', t => {
  let expected = false
  let fn = function(str) {t.is(this.actual, expected, str)}
  fn.properties = {
    actual: false,
    toggle() {this.actual = !this.actual}
  }
  mews('__test__', fn)

  let mew = []
  mew[0] = mews.__test__('initial state')
  expected = true
  mew[1] = mew[0].toggle('first flip')
  expected = false
  mew[0]('initial state retry')
  expected = true
  mew[1].toggle.toggle('double flip')
  mew[2] = mew[1].toggle.toggle('double flip again')
  expected = false
  mew[2].toggle('single flip')
  mew[2].toggle('single flip again')

  delete mews.__test__
  t.end()
})
