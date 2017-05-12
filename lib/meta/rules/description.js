
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
    value = value.trim();

    // if it starts with a location, like articles sometimes do in the opening
    // paragraph, try to remove it
    value = value.replace(/^[A-Z\s]+\s+[-—–]\s+/, '');

    return value;
  };
}

/**
 * Rules.
 */

module.exports = [wrap(function ($) {
  return $('meta[property="og:description"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:description"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="description"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="sailthru.description"]').attr('content');
}), wrap(function ($) {
  return $('meta[itemprop="description"]').attr('content');
}), wrap(function ($) {
  return $('.post-content p').first().text();
}), wrap(function ($) {
  return $('.entry-content p').first().text();
}), wrap(function ($) {
  return $('article p').first().text();
})];
