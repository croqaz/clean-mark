
// const fs = require('fs')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Minimize = require('minimize')
const sanitize = require('./sanitize')
const breakdance = require('breakdance')
const meta = require('./meta')
const read = require('./read')

module.exports = async function clean (link, cb) {
  /**
   * Main function;
   */
  console.log('☟  see dis ...')
  let html, mini, dict
  try {
    html = await fetch(link)
    html = await html.text()
  } catch (err) {
    const msg = `Error fetching: ${err.message}`
    console.error(err)
    return cb(new Error(msg))
  }
  console.log('Scraping page meta-data...')
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
    const mark = convertMd(article.content)
    console.log('☞  baaam!')
    cb(null, mdTemplate(dict, mark))
  })
}

function saneHtml (html) {
  /**
   * This function obviously sanitizes the possibly nasty HTML from some web pages
   */
  console.log('Sanitizing the page content...')
  const opts = {
    nonTextTags: [ 'aside', 'iframe', 'style', 'script', 'textarea', 'noscript' ],
    allowedAttributes: {
      '*': [ 'id', 'class', 'href', 'itemprop', 'src', 'title' ],
      'meta': [ 'content', 'name', 'http-equiv', 'property' ]
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
  console.log('Minifying the HTML...')
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
  console.log('Converting to markdown...')
  const r = breakdance(html)
    .replace(/<br>\n/g, '\n')
    .replace(/(]\(.+?\))(;)(]\(http.+?\))/g, '$1$3')
    .replace(/(\S[.!?])(\n)([ ]|\S)/g, '$1\n\n$3')
    .replace(/\n\n+/g, '\n\n')
  return r
}

function mdTemplate (meta, text) {
  /**
   * Join the meta info and the Markdown, into a pretty Jekyll-like file
   */
  return `---\ntitle: ${meta.title}\nauthor: ${meta.author}\ndate: ${meta.date}\npublisher: ${meta.publisher}\nlink: ${meta.url}\n---\n${text}`
}
