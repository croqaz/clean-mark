
/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return function ($) {
    var value = rule($);
    if (typeof value != 'string') return;

    // remove extra whitespace
    value = value.replace(/\s+/g, ' ');
    value = value.trim();

    return value;
  };
}

/**
 * Rules.
 */

module.exports = [wrap(function ($) {
  return $('meta[property="og:title"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:title"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="sailthru.title"]').attr('content');
}), wrap(function ($) {
  return $('.post-title').text();
}), wrap(function ($) {
  return $('.entry-title').text();
}), wrap(function ($) {
  return $('[itemtype="http://schema.org/BlogPosting"] [itemprop="name"]').text();
}), wrap(function ($) {
  return $('h1[class*="title"] a').text();
}), wrap(function ($) {
  return $('h1[class*="title"]').text();
}), wrap(function ($) {
  return $('title').text();
})];
