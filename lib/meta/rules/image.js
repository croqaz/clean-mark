
var isUrl = require('is-url');

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return function ($) {
    var value = rule($);
    if (!isUrl(value)) return;
    return value;
  };
}

/**
 * Rules.
 */

module.exports = [wrap(function ($) {
  return $('meta[property="og:image:secure_url"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="og:image:url"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="og:image"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:image"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="twitter:image"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:image:src"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="twitter:image:src"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="sailthru.image"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="sailthru.image.full"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="sailthru.image.thumb"]').attr('content');
}), wrap(function ($) {
  return $('article img[src]').first().attr('src');
}), wrap(function ($) {
  return $('#content img[src]').first().attr('src');
}), wrap(function ($) {
  return $('[class*="article"] img[src]').first().attr('src');
}), wrap(function ($) {
  return $('img[src]').first().attr('src');
})];
