const fs = require('fs')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const meta = require('./meta')
const read = require('./read')
const util = require('./util')
const extractor = require('a-extractor')

module.exports = async function clean (link, options = {}) {
  /**
   * Main function;
   * Fetch, broom, meta, sanitize, minimize, content, markdown.
   */
  const { useDatabase, fileType } = options
  let aex, html, mini, article, dict
  if (util.isUrl(link)) {
    try {
      html = await fetch(link)
      html = await html.text()
    } catch (err) {
      throw new Error(`fetching URL: ${err.message}`)
    }
  } else {
    try {
      html = fs.readFileSync(link, 'utf8')
    } catch (err) {
      throw new Error(`reading file: ${err.message}`)
    }
  }
  try {
    dict = await meta(html)
  } catch (err) {
    throw new Error(`extracting meta: ${err.message}`)
  }

  mini = util.saneHtml(html)
  mini = util.minHtml(mini)

  // Unwanted elements
  const dom = util.broomHtml(mini)

  html = null // GC
  mini = null // GC

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
