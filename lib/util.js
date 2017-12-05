const url = require('url')

module.exports.isUrl = function isUrl (string) {
  return /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/.test(string)
}

module.exports.urlPath = function urlPath (link) {
  link = link.replace(/\\(.)/gm, '$1')
  let out = url.parse(link).pathname.replace(/\/+$/g, '')
  out = out.split('/').pop()
  return out.split('.htm')[0]
}
