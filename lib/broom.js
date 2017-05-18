
const url = require('url')
const cheerio = require('cheerio')

module.exports = function domBroom (html, link) {
  /**
   * This function removes the unwanted HTML elements, like:
   comments, headers, footers, share buttons;
   */
  const host = url.parse(link).host
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    decodeEntities: false
  })

  $('#navigation').remove()
  $('#header').remove()
  $('#header-wrapper').remove()
  $('#comments').remove()
  $('#reader-comments').remove()
  $('#respond').remove()
  $('#lower').remove()
  $('#footer').remove()
  $('#sidebar').remove()
  $('#sidebar-wrapper').remove()
  $('.share-button').remove()

  return $
}
