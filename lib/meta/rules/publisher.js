
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

    // remove whitespace and new lines
    value = value.trim();
    value = value.replace(/\n/mg, '');

    return value;
  };
}

/**
 * Rules.
 */

module.exports = [wrap(function ($) {
  return $('meta[property="og:site_name"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="application-name"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="al:android:app_name"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="al:iphone:app_name"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="al:ipad:app_name"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="publisher"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="Publisher"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:app:name:iphone"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:app:name:ipad"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="twitter:app:name:googleplay"]').attr('content');
}), wrap(function ($) {
  return $('#logo').text();
}), wrap(function ($) {
  return $('.logo').text();
}), wrap(function ($) {
  return $('a[class*="brand"]').text();
}), wrap(function ($) {
  return $('[class*="brand"]').text();
}), wrap(function ($) {
  return $('[class*="logo"] a img[alt]').attr('alt');
}), wrap(function ($) {
  return $('[class*="logo"] img[alt]').attr('alt');
}), wrap(function ($) {
  var title = $('title').text().trim();
  var regexp = /^.*?\|\s+(.*)$/;
  var matches = regexp.exec(title);
  if (!matches) return;
  return matches[1];
}), wrap(function ($) {
  return $('[itemtype="http://schema.org/Blog"] [itemprop="name"]').attr('content');
}), wrap(function ($) {
  var desc = $('link[rel="alternate"][type="application/atom+xml"]').attr('title');
  var regexp = /^(.*?)\s[-|]\satom$/i;
  var matches = regexp.exec(desc);
  if (!matches) return;
  return matches[1];
})];
