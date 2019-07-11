const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const charset = require('charset')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const Minimize = require('minimize')
const sanitize = require('sanitize-html')
const breakdance = require('breakdance')

function isUrl (string) {
  return /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/.test(string)
}

function urlPath (link) {
  link = link.replace(/\\(.)/gm, '$1')
  link = new url.URL(link)
  let out = link.pathname.replace(/\/+$/g, '')
  out = out.split('/').pop()
  if (out) {
    return out.split('.htm')[0]
  } else {
    return link.hostname
  }
}

async function fetchUri (uri) {
  let html
  if (isUrl(uri)) {
    try {
      html = await fetch(uri)
      html = await html.buffer()
    } catch (err) {
      throw new Error(`fetching URL: ${err.message}`)
    }
    try {
      const enc = charset({}, html) || 'utf8'
      html = iconv.decode(html, enc)
    } catch (err) {
      throw new Error(`decoding page meta charset: ${err.message}`)
    }
  } else {
    try {
      html = fs.readFileSync(uri, 'utf8')
    } catch (err) {
      throw new Error(`reading file: ${err.message}`)
    }
  }
  return html
}

function broomHtml (html) {
  /**
   * Remove the unwanted HTML elements, like:
   - comments, headers, footers, aside elems;
   */
  const $ = cheerio.load(html, {
    normalizeWhitespace: false,
    decodeEntities: false
  })

  $('#navigation').remove()
  $('#header').remove()
  $('#comments').remove()
  $('#respond').remove()
  $('#lower').remove()
  $('#footer').remove()
  $('#sidebar').remove()

  return $
}

function saneHtml (html) {
  /**
   * Sanitize the possibly nasty HTML from some web pages
   * This step helps the Markdown converter
   */
  const opts = {
    nonTextTags: ['aside', 'iframe', 'link', 'noscript', 'script', 'style'],
    allowedAttributes: {
      '*': [
        'id',
        'class',
        'data-type',
        'href',
        'itemprop',
        'itemtype',
        'rel',
        'src',
        'title'
      ],
      article: ['*'], // Allow all attrs
      main: ['*'],
      meta: ['*']
    },
    allowedTags: [
      'a',
      'article',
      'b',
      'blockquote',
      'body',
      'br',
      'cite',
      'code',
      'div',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'head',
      'header',
      'html',
      'i',
      'img',
      'li',
      'main',
      'meta',
      'ol',
      'p',
      'pre',
      'section',
      'strike',
      'strong',
      'span',
      'time',
      'title',
      'ul'
    ]
  }
  return sanitize(html, opts)
}

function minHtml (html) {
  /**
   * Minimize and clean the sanitized HTML
   */
  const min = new Minimize({ quotes: true })
  return min.parse(html).replace(/(<a .+?><img .+?>)(<\/a>)/g, '$1;$2')
}

function convertMd (html) {
  /**
   * Convert the final HTML, into a clean Markdown
   */
  return breakdance(html)
    .replace(/<br>\n/g, '\n')
    .replace(/(]\(.+?\))(;)(]\(http.+?\))/g, '$1$3')
    .replace(/(\S[.!?])(\n)([ ]|\S)/g, '$1\n\n$3')
}

module.exports = {
  isUrl,
  urlPath,
  fetchUri,
  broomHtml,
  saneHtml,
  minHtml,
  convertMd
}
