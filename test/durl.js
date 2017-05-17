
const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Minimize = require('minimize')
const { isUrl } = require('../lib/util')

let link = process.argv[2]

dl(link)

async function dl (link) {
  if (!link || !isUrl(link)) {
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
  const $ = cheerio.load(html)
  $('script').remove()
  $('style').remove()
  $('link').remove()
  $('iframe').remove()
  html = $.html()
  const mini = new Minimize({ quotes: true }).parse(html)
  // Create host path
  const host = url.parse(link).hostname
  fs.mkdirSync(`test/fixtures/${host}`)
  fs.writeFileSync(`test/fixtures/${host}/source.htm`, mini)
  console.log('Done.')
}
