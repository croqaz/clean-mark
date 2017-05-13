
const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const Minimize = require('minimize')
const sanitize = require('./lib/sanitize')
const meta = require('./lib/meta')
const read = require('./lib/read')
const breakdance = require('breakdance')

let agro = process.argv.indexOf('-agro')
if (agro > -1) {
  process.argv.splice(agro, 1)
  agro = true
}
let link = process.argv[2]

if (!link) {
  console.warn(':<  Plz gimme URL')
  process.exit()
}

if (link.endsWith('/')) {
  link = link.substr(0, link.length-1)
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
    read(mini, (err, article) => {
      if (err) {
        console.error('Error on cleaning article:', err)
        return
      }
      // Article content
      // fs.writeFileSync('test/' + out + '.htm', htmlTemplate(article.content))
      // Markdown content
      const mark = convertMd(article.content)
      console.log('Scraping page meta-data...')
      meta(html)
        .then(m => {
          fs.writeFileSync(out + '.md', mdTemplate(m, mark))
          console.log('☞  baaam!')
        })
        .catch(err => {
          console.error('Error scraping article:', err)
        })
    })
  })
  .catch(err => {
    console.error('Error converting article:', err)
  })

function saneHtml (html) {
  console.log('Sanitizing the page content...')
  const opts = {
    nonTextTags: [ 'style', 'script', 'textarea', 'noscript' ],
    allowedAttributes: { '*': [ 'href', 'src', 'id', 'class', 'title' ] },
    allowedTags: [ 'a', 'article', 'b', 'blockquote', 'br', 'cite', 'code',
    'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'img', 'li', 'ol', 'p', 'pre',
    'section', 'strike', 'strong', 'ul' ]
  }
  if (agro) {
    opts.allowedTags.push('div')
  }
  let r = sanitize(html, opts)
  r = htmlTemplate(r)
  // fs.writeFileSync('test/tmp2.htm', r)
  return r
}

function minHtml (html) {
  console.log('Minifying the HTML...')
  let r = new Minimize({ quotes: true })
    .parse(html)
    .replace(/(<a .+?><img .+?>)(<\/a>)/g, '$1;$2')
  r = htmlTemplate(r)
  // fs.writeFileSync('test/tmp3.htm', r)
  return r
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

function htmlTemplate (html) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`
}

function mdTemplate (meta, text) {
  return `---\ntitle: ${meta.title}\ndescription: ${meta.description}\nauthor: ${meta.author}\ndate: ${meta.date}\npublisher: ${meta.publisher}\nlink: ${meta.url}\n---\n${text}`
}
