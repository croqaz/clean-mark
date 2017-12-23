const meta = require('./meta')
const read = require('./read')
const util = require('./util')
const extractor = require('a-extractor')

const cheerioAdv = require('./sizzle')
const cheerio = cheerioAdv.wrap(require('cheerio'))

module.exports = async function clean (link, options = {}) {
  /**
   * Main function;
   * Fetch, broom, meta, sanitize, minimize, content, markdown.
   */
  const { useDatabase, fileType } = options
  let aex, article, dict

  let html = await util.fetchUri(link)

  try {
    dict = await meta(html)
  } catch (err) {
    throw new Error(`extracting meta: ${err.message}`)
  }

  html = util.saneHtml(html)
  html = util.minHtml(html)

  // Unwanted elements
  const dom = util.broomHtml(html)

  html = null // GC

  // Is the HOST in the A-Extractor database?
  if (useDatabase) {
    aex = extractor.findExtractor(link)
  }

  if (aex) {
    // Use A-Extractor patterns
    if (aex.author) {
      try {
        dict.author = dom(aex.author).text()
      } catch (err) {
        console.error(err)
      }
    }
    if (aex.date) {
      try {
        dict.date = dom(aex.date).text()
      } catch (err) {
        console.error(err)
      }
    }
    article = dom(aex.content)
  } else {
    // Use Readability auto-detection
    try {
      article = (await read(dom)).getContent()
    } catch (err) {
      throw new Error(`extracting content: ${err.message}`)
    }
  }

  if (article.length > 0) {
    // 1, or more elements?
    if (article.length === 1) {
      html = article.html()
    } else if (article.length > 1) {
      html = article
        .map((i, a) => cheerio.load(a).html())
        .get()
        .join(' ')
    }
  }

  if (fileType === 'text') {
    dict.text = html
      .replace(/<\s*br[^>]?>/, '\n\n')
      .replace(/(<([^>]+)>)/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim()
  } else if (fileType === 'html') {
    dict.text = html
  } else {
    dict.text = util.convertMd(html)
  }
  return dict
}
