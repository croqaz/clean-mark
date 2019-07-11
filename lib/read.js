// Original code from:
// https://github.com/bndr/node-read
// I included this in my source to simplify as much as possible

const url = require('url')

// UTILS

/*
 * Regexp inspired from original Arc90 Readability
 */

const regexps = {
  unlikelyCandidatesRe: /combx|pager|comment|disqus|foot|header|menu|meta|nav|rss|shoutbox|sidebar|sponsor|share|bookmark|social|advert|leaderboard|instapaper_ignore|entry-unrelated|read-more/i,
  okMaybeItsACandidateRe: /and|article|body|column|main|story/i,
  positiveRe: /article|body|content|entry|hentry|page|pagination|post|text/i,
  negativeRe: /combx|comment|captcha|contact|feed|foot|footer|footnote|link|media|meta|popular|promo|related|scroll|shoutbox|sponsor|subscribe|utility|tags|widget|tip|dialog/i,
  divToPElementsRe: /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
  trimRe: /^\s+|\s+$/g
}

/**
 * Node Types and their classification
 * */

const nodeTypes = {
  mostPositive: ['article', 'div'],
  positive: ['pre', 'td', 'blockquote'],
  negative: ['address', 'ol', 'ul', 'dl', 'dd', 'dt', 'li'],
  mostNegative: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th']
}

/**
 * Select the TopCandidate from all possible candidates
 * */

function getArticle (candidates, $) {
  let topCandidate = null

  candidates.forEach(elem => {
    const linkDensity = getLinkDensity(elem, $)
    const siblings = elem.children('p').length
    const score = elem.data('readabilityScore')
    elem.data(
      'readabilityScore',
      Math.min(2, Math.max(siblings, 1)) * score * (1 - linkDensity)
    )
    if (
      !topCandidate ||
      elem.data('readabilityScore') > topCandidate.data('readabilityScore')
    ) {
      topCandidate = elem
    }
  })
  /**
   * If we still have no top candidate, just use the body as a last resort.
   * Should not happen.
   * */
  if (topCandidate === null) {
    return $('body')
  }

  // Perhaps the topCandidate is the parent?
  let parent
  if (
    !(parent = topCandidate.parent()) ||
    parent.length === 0 ||
    topCandidate.children('p').length > 5
  ) {
    return filterCandidates(topCandidate, topCandidate.children(), $)
  }
  return filterCandidates(topCandidate, parent.children(), $)
}

/**
 * Filter TopCandidate Siblings (Children) based on their Link Density, and readabilityScore
 * Append the nodes to articleContent
 * */

function filterCandidates (topCandidate, siblings, $) {
  const articleContent = $("<div id='readabilityArticle'></div>")
  const siblingScoreThreshold = Math.max(
    10,
    topCandidate.data('readabilityScore') * 0.3
  )

  siblings.each(function (index, elem) {
    const node = $(this)
    const type = node.get(0).name
    const score = node.data('readabilityScore')
    const children = siblings.contents().length
    let append = false

    if (node.is(topCandidate) || score > siblingScoreThreshold) {
      append = true
    }

    if (children > 0) {
      siblings.contents().each((index, elem) => {
        if (elem.name === 'img') {
          append = true
        }
      })
    }

    if (
      !append &&
      (type === 'p' ||
        type === 'ul' ||
        type === 'blockquote' ||
        type === 'pre' ||
        type === 'h2')
    ) {
      $(elem)
        .find('a')
        .each((index, elems) => {
          if ($(elems).text().length > 1) {
            return
          }
          if (elems.name === 'a') {
            $(elems).remove()
          }
        })

      const linkDensity = getLinkDensity(node, $)
      const len = node.text().length
      if (len < 3) {
        return
      }

      if (len > 80 && linkDensity < 0.25) {
        append = true
      } else if (
        len < 80 &&
        linkDensity === 0 &&
        node.text().replace(regexps.trimRe, '').length > 0
      ) {
        append = true
      }
    }

    if (append) {
      articleContent.append(node)
    }
  })

  return articleContent
}

/**
 * Traverse all Nodes and remove unlikely Candidates.
 * */

function getCandidates ($, base) {
  // Candidates Array
  const candidates = []

  // Iterate over all Nodes in body
  $('*', 'body').each(function (index, element) {
    const node = $(this)

    // If node is null, return, otherwise Illegal Access Error
    if (!node || node.length === 0) {
      return
    }
    const nodeType = node.get(0).name

    // Remove Unlikely Candidates
    const classAndID = (node.attr('class') || '') + (node.attr('id') || '')
    if (
      regexps.unlikelyCandidatesRe.test(classAndID) &&
      !regexps.okMaybeItsACandidateRe.test(classAndID)
    ) {
      return node.remove()
    }

    // Remove Elements that have no children and have no content
    if (
      nodeType === 'div' &&
      node.children().length < 1 &&
      node.text().trim().length < 1
    ) {
      return node.remove()
    }

    // Remove Style
    node.removeAttr('style')

    // Turn all divs that don't have children block level elements into p's
    if (nodeType === 'article' || nodeType === 'div') {
      if (!regexps.divToPElementsRe.test(node.html())) {
        node.replaceWith('<p class="node-read-div2p">' + node.html() + '</p>')
      } else {
        node.contents().each(function (index, element) {
          const child = $(this)
          let childEntity = null
          if (!child || !(childEntity = child.get(0))) {
            return
          }
          if (
            childEntity.type === 'text' &&
            childEntity.data &&
            childEntity.data.replace(regexps.trimRe, '').length > 1
          ) {
            child.replaceWith(
              '<p class="node-read-div2p">' + childEntity.data + '</p>'
            )
          }
        })
      }
    }

    // Score paragraphs
    if (nodeType === 'p' || nodeType === 'pre') {
      return calculateNodeScore(node, candidates)
    }

    // Resolve URLs
    if (base) {
      if (nodeType === 'img' && typeof node.attr('src') !== 'undefined') {
        node.attr('src', new url.URL(base, node.attr('src')))
      }
      if (nodeType === 'a' && typeof node.attr('href') !== 'undefined') {
        node.attr('href', new url.URL(base, node.attr('href')))
      }
    }

    // Clean the headers
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(nodeType) !== -1) {
      const weight = getClassWeight(node, $)
      const density = getLinkDensity(node, $)
      if (weight < 0 || density > 0.3) {
        node.remove()
      }
    }
  })

  // Calculate scores of `P`s that were turned from DIV by us
  $('p.node-read-div2p', 'body').each(function () {
    calculateNodeScore($(this), candidates)
  })

  return candidates
}

/**
 * Give a score to each node based on the Content.
 * @param node
 * @param contentScore
 * @param candidates
 */
function scoreCandidate (node, contentScore, candidates) {
  let score
  if (typeof node.data('readabilityScore') === 'undefined') {
    score = initializeNode(node)
    candidates.push(node)
  } else {
    score = node.data('readabilityScore') || 0
  }
  node.data('readabilityScore', score + contentScore)
}

/**
 * Calculate score of specified node.
 * @param node
 * @param candidates
 */
function calculateNodeScore (node, candidates) {
  const txt = node.text()
  let contentScore = 1

  // Ignore too small nodes
  if (txt.length < 25) {
    return
  }

  // Add points for any commas within this paragraph support Chinese commas
  const commas = txt.match(/[,，.。;；?？、]/g)
  if (commas && commas.length) {
    contentScore += commas.length
  }

  // For every 100 characters in this paragraph, add another point. Up to 3 points.
  contentScore += Math.min(Math.floor(txt.length / 100), 3)

  // If it has an article parent
  if (node.closest('article')) {
    contentScore += 25
  }

  // Initialize Parent and Grandparent
  // First initialize the parent node with contentScore / 1, then grandParentNode with contentScore / 2
  const parent = node.parent()

  if (parent && parent.length > 0) {
    scoreCandidate(parent, contentScore, candidates)
    const grandParent = parent.parent()
    if (grandParent && grandParent.length > 0) {
      scoreCandidate(grandParent, contentScore / 2, candidates)
    }
  }
}

/**
 * Check the type of node, and get its Weight
 * */

function initializeNode (node) {
  if (!node || node.length === 0) {
    return 0
  }
  const tag = node.get(0).name
  if (nodeTypes.mostPositive.indexOf(tag) >= 0) {
    return 5 + getClassWeight(node)
  }
  if (nodeTypes.positive.indexOf(tag) >= 0) {
    return 3 + getClassWeight(node)
  }
  if (nodeTypes.negative.indexOf(tag) >= 0) {
    return -3 + getClassWeight(node)
  }
  if (nodeTypes.mostNegative.indexOf(tag) >= 0) {
    return -5 + getClassWeight(node)
  }
  return -1
}

/**
 * Node Weight is calculated based on className and ID of the node.
 * */

function getClassWeight (node) {
  if (node === null || node.length === 0) {
    return 0
  }
  const name = node.get(0).name || ''
  const cls = node.attr('class') || ''
  const nid = node.attr('id') || ''
  let weight = 0

  // Schema.org/Article
  if (node.attr('itemprop') && /articleBody/.test(node.attr('itemprop'))) {
    weight += 50
  }
  // Nodes of type text
  if (node.attr('type') && node.attr('type') === 'text') {
    weight += 30
  }
  // Special cases
  if (name === 'article') {
    weight += 25
  }
  if (name === 'section') {
    weight += 10
  }
  if (name === 'header' || name === 'aside' || name === 'footer') {
    weight -= 25
  }
  if (cls === 'comments' && nid === 'comments') {
    weight -= 25
  }

  if (cls.search(regexps.negativeRe) !== -1) {
    weight -= 25
  }
  if (nid.search(regexps.negativeRe) !== -1) {
    weight -= 20
  }
  if (cls.search(regexps.positiveRe) !== -1) {
    weight += 25
  }
  if (nid.search(regexps.positiveRe) !== -1) {
    weight += 20
  }

  return weight
}

/**
 * Get Link density of this node.
 * Total length of link text in this node divided by the total text of the node.
 * Relative links are not included.
 * */

function getLinkDensity (node, $) {
  const links = node.find('a')
  const textLength = node.text().length
  let linkLength = 0

  links.each(function (index, elem) {
    const href = $(this).attr('href')
    if (!href || (href.length > 0 && href[0] === '#')) {
      return
    }
    linkLength += $(this).text().length
  })

  return linkLength / textLength || 0
}

/**
 * Main method
 * If the first run does not succeed, try the body element;
 * */

function extract ($, base) {
  const candidates = getCandidates($, base)
  let article = getArticle(candidates, $)
  if (article.length < 1) {
    article = getArticle([$('body')], $)
  }
  return article
}

// ARTICLE

function Article (dom) {
  this.$ = dom // Will be modified in-place after analyzing
  this.cache = {}
  this.base = false
}

Article.prototype.getContent = function () {
  if (typeof this.cache.content !== 'undefined') {
    return this.cache.content
  }
  const content = extract(this.$, this.base)
  this.cache.content = content
  return content
}

module.exports = function (dom) {
  return new Promise((resolve, reject) => {
    if (dom('body').length < 1) {
      reject(new Error('No body tag was found'))
    } else {
      resolve(new Article(dom))
    }
  })
}
