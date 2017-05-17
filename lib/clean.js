
const fs = require('fs')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Minimize = require('minimize')
const sanitize = require('./sanitize')
const breakdance = require('breakdance')
const { isUrl } = require('./util')
const meta = require('./meta')
const read = require('./read')

module.exports = async function clean (link, cb) {
  /**
   * Main function;
   */
  let html, mini, dict
  if (isUrl(link)) {
    try {
      html = await fetch(link, {
        // headers: {
        // 'user-agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.7.01001)'
        // }
      })
      html = await html.text()
    } catch (err) {
      const msg = `Error fetching: ${err.message}`
      console.error(err)
      return cb(new Error(msg))
    }
  } else {
    try {
      html = fs.readFileSync(link, 'utf8')
    } catch (err) {
      const msg = `Error fetching: ${err.message}`
      console.error(err)
      return cb(new Error(msg))
    }
  }

  // console.log('Scraping page meta-data...')
  try {
    dict = await meta(html)
  } catch (err) {
    const msg = `Error extracting: ${err.message}`
    console.error(err)
    return cb(new Error(msg))
  }
  mini = saneHtml(html)
  mini = minHtml(mini)
  mini = removeUnwanted(mini)
  html = null // GC
  // Readability
  read(mini, (err, article) => {
    if (err) {
      const msg = `Error cleaning: ${err.message}`
      console.error(msg)
      return cb(new Error(msg))
    }
    // Article content for debug
    // fs.writeFileSync('test/tmp3.htm', article.content)
    // Markdown content
    dict.text = convertMd(article.content)
    cb(null, dict)
  })
}

function saneHtml (html) {
  /**
   * This function obviously sanitizes the possibly nasty HTML from some web pages
   */
  // console.log('Sanitizing the page content...')
  const opts = {
    nonTextTags: [ 'aside', 'iframe', 'link', 'noscript', 'script', 'style', 'textarea' ],
    allowedAttributes: {
      '*': [ 'id', 'class', 'href', 'itemprop', 'src', 'title' ],
      'article': [ '*' ], // Allow all attrs
      'meta': [ '*' ]
    },
    allowedTags: [ 'a', 'article', 'b', 'blockquote', 'body', 'br', 'cite',
      'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'html',
      'i', 'img', 'li', 'meta', 'ol', 'p', 'pre', 'section', 'strike', 'strong',
      'title', 'ul' ]
  }
  let r = sanitize(html, opts)
  // fs.writeFileSync('test/tmp1.htm', r)
  return r
}

function minHtml (html) {
  /**
   * This function obviously minimizes and cleans the sanitized HTML
   */
  // console.log('Minifying the HTML...')
  let r = new Minimize({ quotes: true })
    .parse(html)
    .replace(/(<a .+?><img .+?>)(<\/a>)/g, '$1;$2')
  // fs.writeFileSync('test/tmp2.htm', r)
  return r
}

function removeUnwanted (html) {
  /**
   * This function removes the unwanted HTML elements, like:
   comments, headers, footers, share buttons;
   */
  const $ = cheerio.load(html)
  $('#comments').remove()
  $('#reader-comments').remove()
  $('#respond').remove()
  $('#lower').remove()
  $('#header').remove()
  $('#header-wrapper').remove()
  $('#footer').remove()
  $('#sidebar').remove()
  $('#sidebar-wrapper').remove()
  $('.share-button').remove()
  return $.html()
}

function convertMd (html) {
  /**
   * This function converts the final HTML, into a clean Markdown
   */
  // console.log('Converting to markdown...')
  const r = breakdance(html)
    .replace(/<br>\n/g, '\n')
    .replace(/(]\(.+?\))(;)(]\(http.+?\))/g, '$1$3')
    .replace(/(\S[.!?])(\n)([ ]|\S)/g, '$1\n\n$3')
    .replace(/\n\n+/g, '\n\n')
  return r
}
