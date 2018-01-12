
const { json } = require('micro')
const clean = require('./')

async function handler (req, res) {
  const data = await json(req)
  const md = await clean(data.url, { fileType: 'html' })
  return md
}

const cors = require('micro-cors')({
  allowMethods: ['POST']
})

module.exports = cors(handler)
