
const fs = require('fs')
const fetch = require('node-fetch')
const sanitize = require('sanitize-html')
const { minify } = require('html-minifier')
const metascraper = require('metascraper')
const breakdance = require('breakdance')

const url = process.argv[2]

if (!url) {
  console.warn('Plz gimme url')
  process.exit()
}

console.log('☟  dis ...')

fetch(url)
  .then(res => res.text())
  .then(html => {
    console.log('Sanitizing the page content...')
    fs.writeFileSync('tmp1.htm', html)
    const sane = sanitize(html)
    console.log('Minifying the HTML...')
    fs.writeFileSync('tmp2.htm', sane)
    const mini = minHtml(sane)
    console.log('Converting to markdown...')
    fs.writeFileSync('tmp3.htm', mini)
    const mark = breakdance(mini)
      .replace(/\<br>\n/g, '\n')
      .replace(/(\S[\.\!\?])(\n)([ ]|\S)/g, '$1\n\n$3')
      .replace(/\n\n+/g, '\n\n')
    metascraper.scrapeHtml(html)
      .then(meta => {
        console.log('Scraping page meta-data...')
        fs.writeFileSync('content.md', template(meta, mark))
        console.log('☞  baaam!')
      })
  })
  .catch(function(err) {
    console.error('Error converting artice:', err)
  })

function minHtml (html) {
  return minify(html, {
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
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    collapseBooleanAttributes: true
  })
}

function template (meta, text) {
return `---
title: ${meta.title}
description: ${meta.description}
author: ${meta.author}
date: ${meta.date}
publisher: ${meta.publisher}
link: ${meta.url}
---

${text}`
}
