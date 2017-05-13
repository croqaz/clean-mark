
const chrono = require('chrono-node')

const isoformat = '^\\d{4}-\\d{2}-\\d{2}' +       // Match YYYY-MM-DD
                  '((T\\d{2}:\\d{2}(:\\d{2})?)' + // Match THH:mm:ss
                  '(\\.\\d{1,6})?' +              // Match .sssss
                  '(Z|(\\+|-)\\d{2}:\\d{2})?)?$'; // Time zone (Z or +hh:mm)

function isIso (val) {
  const matcher = new RegExp(isoformat);
  return typeof val === 'string' && matcher.test(val) && !isNaN(Date.parse(val))
}

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return function ($) {
    var value = rule($);
    if (!value) return;

    // remove whitespace for easier parsing
    value = value.trim();

    // convert isodates to restringify, because sometimes they are truncated
    if (isIso(value)) return new Date(value).toISOString();

    // parse number strings as milliseconds
    if (/^[0-9]+$/.test(value)) {
      var int = parseInt(value, 10);
      var date = new Date(int);
      return date.toISOString();
    }

    // try to parse with the built-in date parser
    var native = new Date(value);
    if (!isNaN(native.getTime())) return native.toISOString();

    // try to parse a complex date string
    var parsed = chrono.parseDate(value);
    if (parsed) return parsed.toISOString();
  };
}

/**
 * Rules.
 */

module.exports = [wrap(function ($) {
  return $('meta[property="article:published_time"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="dc.date"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="DC.date"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="dc.date.issued"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="DC.date.issued"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="dc.date.created"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="DC.date.created"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="DC.Date"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="date"]').attr('content');
}), wrap(function ($) {
  return $('meta[name="dcterms.date"]').attr('content');
}), wrap(function ($) {
  return $('[itemprop="datePublished"]').attr('content');
}), wrap(function ($) {
  return $('time[itemprop*="pubDate"]').attr('datetime');
}), wrap(function ($) {
  return $('time[itemprop*="pubdate"]').attr('datetime');
}), wrap(function ($) {
  return $('[property*="dc:date"]').attr('content');
}), wrap(function ($) {
  return $('[property*="dc:created"]').attr('content');
}), wrap(function ($) {
  return $('time[datetime][pubdate]').attr('datetime');
}), wrap(function ($) {
  return $('meta[name="sailthru.date"]').attr('content');
}), wrap(function ($) {
  return $('meta[property="book:release_date"]').attr('content');
}), wrap(function ($) {
  return $('time[datetime]').attr('datetime');
}), wrap(function ($) {
  return $('[class*="byline"]').text();
}), wrap(function ($) {
  return $('[class*="dateline"]').text();
}), wrap(function ($) {
  return $('[class*="date"]').text();
}), wrap(function ($) {
  return $('[id*="date"]').text();
}), wrap(function ($) {
  return $('[class*="post-meta"]').text();
}), wrap(function ($, url) {
  var regexp = /(\d{4}[\-\/]\d{2}[\-\/]\d{2})/;
  var match = regexp.exec(url);
  if (!match) return;
  var string = match[1];
  var date = new Date(string);
  return date.toISOString();
}), wrap(function ($) {
  var text = $('[class*="byline"]').text();
  if (!text) return;
  var regexp = /(\w+ \d{2},? \d{4})/;
  var match = regexp.exec(text);
  if (!match) return;
  var string = match[1];
  var date = new Date(string);
  return date.toISOString();
})];
