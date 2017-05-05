
const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const sanitize = require('sanitize-html')
const { minify } = require('html-minifier')
const metascraper = require('metascraper')
const breakdance = require('breakdance')

const link = process.argv[2]

if (!link) {
  console.warn(':<  Plz gimme URL')
  process.exit()
}

let out = url.parse(link).path
out = out.split('/').pop()
out = out.split('.htm')[0]

console.log('☟  see dis ...')

fetch(link)
  .then(res => res.text())
  .then(html => {
    const sane = saneHtml(html)
    const mini = minHtml(sane)
    const mark = convertMd(mini)
    console.log('Scraping page meta-data...')
    metascraper.scrapeHtml(html)
      .then(meta => {
        fs.writeFileSync(out + '.md', template(meta, mark))
        console.log('☞  baaam!')
      })
      .catch(err => {
        console.error('Error scraping article:', err)
      })
  })
  .catch(err => {
    console.error('Error converting article:', err)
  })

function saneHtml (html) {
  // fs.writeFileSync('tmp1.htm', html)
  console.log('Sanitizing the page content...')
  const r = sanitize(html, {
    nonTextTags: [ 'style', 'script', 'textarea', 'noscript', 'div' ],
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'pre', 'img' ]
  })
  // fs.writeFileSync('tmp2.htm', r)
  return r
}

function minHtml (html) {
  console.log('Minifying the HTML...')
  const r = minify(html, {
    minifyJS: true,
    minifyCSS: true,
    sortClassName: true,
    sortAttributes: true,
    caseSensitive: false,
    removeComments: true,
    collapseWhitespace: true,
    preserveLineBreaks: false,
    removeOptionalTags: true,
    removeEmptyElements: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true
  }).replace(/(\<a .+?>\<img .+?>)(\<\/a>)/g, '$1;$2')
  // fs.writeFileSync('tmp3.htm', r)
  return r
}

function convertMd (html) {
  console.log('Converting to markdown...')
  const r = breakdance(html)
    .replace(/\<br>\n/g, '\n')
    .replace(/(\S[\.\!\?])(\n)([ ]|\S)/g, '$1\n\n$3')
    .replace(/\n\n+/g, '\n\n')
  return r
}

function template (meta, text) {
  return `---\ntitle: ${meta.title}\ndescription: ${meta.description}\nauthor: ${meta.author}\ndate: ${meta.date}\npublisher: ${meta.publisher}\nlink: ${meta.url}\n---\n${text}`
}
