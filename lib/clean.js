
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Minimize = require('minimize')
const sanitize = require('./sanitize')
const breakdance = require('breakdance')
const meta = require('./meta')
const read = require('./read')

module.exports = function clean (link, cb) {
  console.log('☟  see dis ...')
  fetch(link)
    .then(res => res.text())
    .then(html => {
      const sane = saneHtml(html)
      const mini = minHtml(sane)

      read(removeUnwanted(mini), (err, article) => {
        if (err) {
          const msg = `Error cleaning: ${err.message}`
          console.error(msg)
          return cb(new Error(msg))
        }
        // Article content for debug
        // fs.writeFileSync('test/tmp3.htm', article.content)
        // Markdown content
        const mark = convertMd(article.content)
        console.log('Scraping page meta-data...')
        meta(html)
          .then(m => {
            console.log('☞  baaam!')
            if (cb && typeof (cb) === 'function') {
              cb(null, mdTemplate(m, mark))
            } else {
              cb(null, 'ok')
            }
          })
          .catch(err => {
            const msg = `Error scraping: ${err.message}`
            console.error(msg)
            cb(new Error(msg))
          })
      })
    })
    .catch(err => {
      const msg = `Error converting: ${err.message}`
      console.error(msg)
      cb(new Error(msg))
    })
}

function saneHtml (html) {
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
  console.log('Minifying the HTML...')
  let r = new Minimize({ quotes: true })
    .parse(html)
    .replace(/(<a .+?><img .+?>)(<\/a>)/g, '$1;$2')
  // fs.writeFileSync('test/tmp2.htm', r)
  return r
}

function removeUnwanted (html) {
  const $ = cheerio.load(html, { normalizeWhitespace: true })
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
  console.log('Converting to markdown...')
  const r = breakdance(html)
    .replace(/<br>\n/g, '\n')
    .replace(/(]\(.+?\))(;)(]\(http.+?\))/g, '$1$3')
    .replace(/(\S[.!?])(\n)([ ]|\S)/g, '$1\n\n$3')
    .replace(/\n\n+/g, '\n\n')
  return r
}

function mdTemplate (meta, text) {
  return `---\ntitle: ${meta.title}\nauthor: ${meta.author}\ndate: ${meta.date}\npublisher: ${meta.publisher}\nlink: ${meta.url}\n---\n${text}`
}
