
const url = require('url')

module.exports.isUrl = function isUrl (string) {
  return /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/.test(string)
}

module.exports.urlPath = function urlPath (link) {
  if (link.endsWith('/')) {
    link = link.substr(0, link.length - 1)
  }
  let out = url.parse(link).path
  out = out.split('/').pop()
  return out.split('.htm')[0]
}
