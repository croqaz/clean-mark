
const fs = require('fs')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const Minimize = require('minimize')
const sanitize = require('./sanitize')
const breakdance = require('breakdance')
const { isUrl } = require('./util')
const broom = require('./broom')
const meta = require('./meta')
const read = require('./read')
const extractor = require('a-extractor')

module.exports = async function clean (link, {useDatabase, fileType}) {
  /**
   * Main function;
   * Fetch, sanitize, minimize, broom, meta, content, markdown.
   */
  let aex, html, mini, article, dict
  if (isUrl(link)) {
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

  mini = saneHtml(html)
  mini = minHtml(mini)
  const dom = broom(mini)
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
    if (article.length > 0) {
      // 1, or more elements?
      if (article.length === 1) {
        html = article.html()
      } else if (article.length > 1) {
        html = article.map(
          (i, a) => cheerio.load(a).html()
        ).get().join(' ')
      }
    }
  } else {
    // Use Readability auto-detection
    try {
      article = (await read(dom)).getContent()
    } catch (err) {
      throw new Error(`extracting content: ${err.message}`)
    }
  }

  if (fileType === 'text') {
    dict.text = article.text()
  } else if (fileType === 'html') {
    dict.text = html
  } else {
    dict.text = convertMd(html)
  }
  return dict
}

function saneHtml (html) {
  /**
   * Sanitize the possibly nasty HTML from some web pages
   * This step helps the Markdown converter
   */
  const opts = {
    nonTextTags: [ 'aside', 'iframe', 'link', 'noscript', 'script', 'style', 'textarea' ],
    allowedAttributes: {
      '*': [ 'id', 'class', 'data-type', 'href', 'itemprop', 'itemtype', 'rel', 'src', 'title', 'type' ],
      'article': [ '*' ], // Allow all attrs
      'meta': [ '*' ]
    },
    allowedTags: [ 'a', 'article', 'b', 'blockquote', 'body', 'br', 'cite',
      'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'html',
      'i', 'img', 'li', 'meta', 'ol', 'p', 'pre', 'section', 'strike', 'strong',
      'span', 'time', 'title', 'ul' ]
  }
  const r = sanitize(html, opts)
  // fs.writeFileSync('test/tmp1.htm', r)
  return r
}

function minHtml (html) {
  /**
   * Minimize and clean the sanitized HTML
   */
  const r = new Minimize({ quotes: true })
    .parse(html)
    .replace(/(<a .+?><img .+?>)(<\/a>)/g, '$1;$2')
  // fs.writeFileSync('test/tmp2.htm', r)
  return r
}

function convertMd (html) {
  /**
   * Convert the final HTML, into a clean Markdown
   */
  const r = breakdance(html)
    .replace(/<br>\n/g, '\n')
    .replace(/(]\(.+?\))(;)(]\(http.+?\))/g, '$1$3')
    .replace(/(\S[.!?])(\n)([ ]|\S)/g, '$1\n\n$3')
  return r
}
