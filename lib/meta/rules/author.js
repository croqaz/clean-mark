
const { isUrl } = require('../../util')

function toTitleCase (text) {
  if (!text) { return '' }
  return text.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap (rule) {
  return ($) => {
    let value = rule($)
    if (typeof value !== 'string') return
    if (isUrl(value)) return
    if (value.indexOf('www.') === 0) return
    if (value.includes('|')) return

    // trim extra whitespace
    value = value.replace(/\s+/g, ' ')
    value = value.trim()

    // remove any extra "by" in the start of the string
    value = value.replace(/^[\s\n]*by[\s\n]*/im, '')

    // make it title case, since some sites have it in weird casing
    value = toTitleCase(value)

    return value
  }
}

/**
 * Enforce stricter matching for a `rule`.
 *
 * @param {Function} rule
 * @return {Function} stricter
 */

function strict (rule) {
  return function ($) {
    var value = rule($)
    var regexp = /^\S+\s+\S+/
    if (!regexp.test(value)) return
    return value
  }
}

const getFirst = ($, collection) =>
  collection
    .filter((i, el) =>
      $(el)
        .text()
        .trim()
    )
    .first()
    .text()

/**
 * Rules.
 */

module.exports = [
  wrap($ => $('meta[property="author"]').attr('content')),
  wrap($ => $('meta[property="article:author"]').attr('content')),
  wrap($ => $('meta[name="author"]').attr('content')),
  wrap($ => $('meta[name="sailthru.author"]').attr('content')),
  wrap($ =>
    $('[rel="author"]')
      .first()
      .text()
  ),
  wrap($ =>
    $('[itemprop*="author"] [itemprop="name"]')
      .first()
      .text()
  ),
  wrap($ =>
    $('[itemprop*="author"]')
      .first()
      .text()
  ),
  wrap($ => $('meta[property="book:author"]').attr('content')),
  strict(
    wrap($ =>
      $('a[class*="author"]')
        .first()
        .text()
    )
  ),
  strict(
    wrap($ =>
      $('[class*="author"] a')
        .first()
        .text()
    )
  ),
  strict(wrap($ => getFirst($, $('a[href*="/author/"]')))),
  wrap($ =>
    $('a[class*="screenname"]')
      .first()
      .text()
  ),
  strict(
    wrap($ =>
      $('[class*="author"]')
        .first()
        .text()
    )
  ),
  strict(
    wrap($ =>
      $('[class*="byline"]')
        .first()
        .text()
    )
  ),
  wrap($ => getFirst($, $('.fullname'))),
  wrap($ => $('[class*="user-info"]').text())
]
