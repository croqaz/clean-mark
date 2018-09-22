// Original code from:
// https://github.com/ianstormtaylor/metascraper
// I included this in my source to simplify as much as possible

const RULES = require('./rules')
const cheerio = require('cheerio')

/**
 * Scrape each entry in the metadata result dictionary in parallel.
 *
 * @param {String} html
 * @param {String} url
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeMetadata (html, rules) {
  rules = rules || RULES
  const keys = Object.keys(rules)
  const $ = cheerio.load(html)
  const promises = keys.map(function (key) {
    return scrapeMetadatum($, '', rules[key])
  })

  return Promise.all(promises).then(function (values) {
    return keys.reduce(function (memo, key, i) {
      memo[key] = values[i]
      return memo
    }, {})
  })
}

/**
 * Scrape the first non-null value returned by an array of `rules` functions for
 * a single property in the metadata result dictionary.
 *
 * @param {Cheerio} $
 * @param {String} url
 * @param {Array or Function} rules
 * @return {Promise} value
 */

function scrapeMetadatum ($, url, rules) {
  if (!Array.isArray(rules)) rules = [rules]

  return rules.reduce(function (promise, rule) {
    return promise.then(function (value) {
      if (value != null && value !== '') return value
      var next = rule($, url)
      if (next != null && next !== '') return next
      return null
    })
  }, Promise.resolve())
}

module.exports = scrapeMetadata
