
const cheerio = require('cheerio')

module.exports = function domBroom (html) {
  /**
   * Remove the unwanted HTML elements, like:
   - comments, headers, footers, share buttons;
   */
  const $ = cheerio.load(html, {
    normalizeWhitespace: false,
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
