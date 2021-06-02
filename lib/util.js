const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const Minimize = require('minimize')
const sanitize = require('sanitize-html')
const TurndownService = require('turndown')

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

async function fetchUri (uri, encoding = 'utf-8') {
  let resp, html
  if (isUrl(uri)) {
    try {
      resp = await fetch(uri)
    } catch (err) {
      throw new Error(`fetching URL: ${err.message}`)
    }
    try {
      html = await resp.buffer()
    } catch (err) {
      throw new Error(`fetching URL: ${err.message}`)
    }
    try {
      html = iconv.decode(html, encoding)
    } catch (err) {
      throw new Error(`decoding page: ${err.message}`)
    }
  } else {
    try {
      html = fs.readFileSync(uri, encoding)
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
    nonTextTags: ['aside', 'iframe', 'link', 'noscript', 'script', 'style', 'option'],
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
  const turnDown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  })
  return turnDown
    .turndown(html)
    .replace(/<br>\n/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
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
