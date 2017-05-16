
const { json } = require('micro')
const clean = require('./lib/clean')

module.exports = async function (req, res) {
  const data = await json(req)
  clean(data.url, (err, md) => {
    if (err) res.end(err)
    return res.end(md)
  })
}
