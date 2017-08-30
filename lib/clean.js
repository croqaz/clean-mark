
const fs = require('fs')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Minimize = require('minimize')
const sanitize = require('./sanitize')
const breakdance = require('breakdance')
const { isUrl } = require('./util')
const broom = require('./broom')
const meta = require('./meta')
const read = require('./read')

module.exports = async function clean (link) {
  /**
   * Main function;
   */
  let html, mini, article, dict
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
  const dom = broom(mini, link)
  html = null // GC
  mini = null // GC
  // Readability
  try {
    article = await read(dom)
  } catch (err) {
    const msg = `Error cleaning: ${err.message}`
    console.error(err)
    throw new Error(msg)
  }
  // Article content for debug
  // fs.writeFileSync('test/tmp3.htm', article.content)
  // Markdown content
  dict.text = convertMd(article.getContent())
  return dict
}

function saneHtml (html) {
  /**
   * This function obviously sanitizes the possibly nasty HTML from some web pages
   */
  const opts = {
    nonTextTags: [ 'aside', 'iframe', 'link', 'noscript', 'script', 'style', 'textarea' ],
    allowedAttributes: {
      '*': [ 'id', 'class', 'href', 'itemprop', 'itemtype', 'src', 'title', 'type' ],
      'article': [ '*' ], // Allow all attrs
      'meta': [ '*' ]
    },
    allowedTags: [ 'a', 'article', 'b', 'blockquote', 'body', 'br', 'cite',
      'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'html',
      'i', 'img', 'li', 'meta', 'ol', 'p', 'pre', 'section', 'strike', 'strong',
      'title', 'ul' ]
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
