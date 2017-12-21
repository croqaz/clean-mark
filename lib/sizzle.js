const util = require('util')

const splitter = /^(.*?)(?::(gt|lt|eq|(?:(?:first|last)(?!-child)))(?:\((\d+)\))?)(.*)/

exports.wrap = function (Cheerio) {
  const CheerioAdv = function (selector, context, root, opts) {
    if (!(this instanceof CheerioAdv)) {
      return new CheerioAdv(selector, context, root, opts)
    }

    if (typeof selector === 'string' && splitter.test(selector)) {
      const steps = split(selector)
      const cursor = Cheerio(steps.shift(), context, root, opts)
      return execSteps(cursor, steps)
    }

    return Cheerio.apply(Cheerio, arguments)
  }

  util.inherits(CheerioAdv, Cheerio)

  CheerioAdv.load = function () {
    const $ = Cheerio.load.apply(Cheerio, arguments)
    return function (selector, context, root) {
      if (typeof selector === 'string') { return exports.find($, selector, context, root) }
      return $.apply(Cheerio, arguments)
    }
  }

  return CheerioAdv
}

exports.find = function find ($, selector, context, root) {
  return exports.compile(selector)($, context, root)
}

exports.compile = function compile (selector) {
  const steps = split(selector)
  selector = steps.shift()

  return function ($, context, root) {
    const cursor = $(selector, context, root)
    return execSteps(cursor, steps)
  }
}

function split (selector) {
  const steps = []
  var match = selector.match(splitter)

  while (match) {
    steps.push(match[1])
    steps.push(selectors[match[2]](match[3]))
    selector = match[4].trim()
    match = selector.match(splitter)
  }

  steps.push(selector)

  return steps.filter(function (step) {
    return step !== ''
  })
}

function execSteps (cursor, steps) {
  return steps.reduce(function (cursor, step) {
    return typeof step === 'function' ? step(cursor) : cursor.find(step)
  }, cursor)
}

var selectors = {
  eq: function (index) {
    index = parseInt(index, 10)
    return function (cursor) {
      return cursor.eq(index)
    }
  },

  first: function () {
    return function (cursor) {
      return cursor.first()
    }
  },

  last: function () {
    return function (cursor) {
      return cursor.last()
    }
  },

  gt: function (index) {
    index = parseInt(index, 10)
    return function (cursor) {
      return cursor.slice(index + 1)
    }
  },

  lt: function (index) {
    index = parseInt(index, 10)
    return function (cursor) {
      return cursor.slice(0, index - 1)
    }
  }
}
