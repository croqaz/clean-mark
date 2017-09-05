
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

module.exports = async function clean (link, use_database=false) {
  /**
   * Main function;
   */
  let aex, html, mini, article, dict
  if (isUrl(link)) {
    try {
      html = await fetch(link)
      html = await html.text()
    } catch (err) {
      const msg = `Error fetching: ${err.message}`
      console.error(err)
      throw new Error(msg)
    }
  } else {
    try {
      html = fs.readFileSync(link, 'utf8')
    } catch (err) {
      const msg = `Error fetching: ${err.message}`
      console.error(err)
      throw new Error(msg)
    }
  }
  try {
    dict = await meta(html)
  } catch (err) {
    const msg = `Error extracting: ${err.message}`
    console.error(err)
    throw new Error(msg)
  }

  mini = saneHtml(html)
  mini = minHtml(mini)
  const dom = broom(mini)
  html = null // GC
  mini = null // GC

  if (use_database) {
    aex = extractor.findExtractor(link)
  }
  // Article extractor
  if (aex) {
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
          (i,a) => cheerio.load(a).html()
        ).get().join(' ')
      }
      // Markdown content
      dict.text = convertMd(html)
      return dict
    }
  }

  // Readability
  try {
    article = (await read(dom)).getContent()
  } catch (err) {
    const msg = `Error cleaning: ${err.message}`
    console.error(err)
    throw new Error(msg)
  }
  // Article content for debug
  // fs.writeFileSync('test/tmp3.htm', article.content)

  // Markdown content
  dict.text = convertMd(article)
  return dict
}

function saneHtml (html) {
  /**
   * This function obviously sanitizes the possibly nasty HTML from some web pages
   */
  const opts = {
    nonTextTags: [ 'aside', 'iframe', 'link', 'noscript', 'script', 'style', 'textarea' ],
    allowedAttributes: {
      '*': [ 'id', 'class', 'data-type', 'href', 'itemprop', 'itemtype', 'src', 'title', 'type' ],
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
   * This function obviously minimizes and cleans the sanitized HTML
   */
  const r = new Minimize({ quotes: true })
    .parse(html)
    .replace(/(<a .+?><img .+?>)(<\/a>)/g, '$1;$2')
  // fs.writeFileSync('test/tmp2.htm', r)
  return r
}

function convertMd (html) {
  /**
   * This function converts the final HTML, into a clean Markdown
   */
  const r = breakdance(html)
    .replace(/<br>\n/g, '\n')
    .replace(/(]\(.+?\))(;)(]\(http.+?\))/g, '$1$3')
    .replace(/(\S[.!?])(\n)([ ]|\S)/g, '$1\n\n$3')
  return r
}
