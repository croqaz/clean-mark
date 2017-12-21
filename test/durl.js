const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const util = require('../lib/util')

dl(process.argv[2])

async function dl (link) {
  if (!link || !util.isUrl(link)) {
    console.warn(':<  Plz gimme URL')
    return false
  }
  console.log(`Will download "${link}"`)
  let html
  try {
    html = await fetch(link)
    html = await html.text()
  } catch (err) {
    console.error(`Error fetching: ${err.message}`)
    return
  }
  const mini = util.minHtml(util.broom(html))
  // Create host path
  const host = url.parse(link).hostname
  fs.mkdirSync(`test/fixtures/${host}`)
  fs.writeFileSync(`test/fixtures/${host}/source.htm`, mini)
  console.log('Done.')
}
