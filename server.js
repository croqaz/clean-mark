
const { json } = require('micro')
const c = require('./lib/clean')

module.exports = async function (req, res) {
  const data = await json(req)
  // console.log(data)
  c.clean(data.url, 'test', (err, html) => {
    if (err) res.end(err)
    return res.end(html)
  })
}
