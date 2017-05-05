
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

fetch(url)
  .then(res => res.text())
  .then(html => {
    fs.writeFileSync('tmp1.htm', html)
    const sane = sanitize(html)
    fs.writeFileSync('tmp2.htm', sane)
    const mini = minHtml(sane)
    fs.writeFileSync('tmp3.htm', mini)
    const mark = breakdance(mini)
      .replace(/\<br>\n/g, '\n')
      .replace(/(\S[\.\!\?])(\n)([ ]|\S)/g, '$1\n\n$3')
      .replace(/\n\n+/g, '\n\n')
    metascraper.scrapeHtml(html)
      .then(meta => {
        fs.writeFileSync('content.md', template(meta, mark))
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
