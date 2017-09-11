
const S = require('string')

function cleanText (text) {
  text = S(text)
    .trim()
    .unescapeHTML()
    .stripTags()
    .latinise()
    .replaceAll('§', '')
    .replace(/\n?[ ]*\d+(\.)[ ]/g, '')      // Fix number lists
    .replace(/(\[.*?\])\((?:.+?)\)/g, '$1') // Keep link description, delete URL
    .replace(/!\[(.*?)\]\((.*?)\)/g, ' ')   // Delete images
    .replace(/(?:\*\*|__)(.*?)\1/g, '$1')   // Delete bold and italic tags
    .replace(/[.!?]/g, '. ')      // Unify terminators
    .replace(/([.])[.]+/g, '.')   // Fix duplicated terminators
    .replace(/[,;()&+]|--/g, ' ') // Replace commas, hyphens etc (count them as spaces)
    .replace(/[ \t]+/g, ' ')      // Remove multiple spaces
    .trim()
    .ensureRight('.')
    .s

  return text
}

function wordCount (text) {
  text = cleanText(text)
  return text.split(/[ ]+/i).length
}

function sentenceCount (text) {
  text = cleanText(text)
  return S(text).count('.')
}

function paragraphCount (text) {
  text = cleanText(text)
  return S(text).count('\n\n') + 1
}

function averageWordsPerSentence (text) {
  text = cleanText(text)
  return wordCount(text) / sentenceCount(text)
}

module.exports = {
  wordCount,
  sentenceCount,
  paragraphCount,
  averageWordsPerSentence
}
