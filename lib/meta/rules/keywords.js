
function wrap (rule) {
  return ($) => {
    let value = rule($)
    if (typeof value !== 'string') return
    // remove extra whitespace
    return value.trim()
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="article:tag"]')
    .map(function () { return $(this).attr('content') }).get().join()),
  wrap(($) => $('meta[name="keywords"]').attr('content')),
  wrap(($) => $('a[rel="tag"]')
    .map(function () { return $(this).text() }).get().join())
]
