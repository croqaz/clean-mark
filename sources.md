
# Clean-mark sources

- Yahoo News
  - Article:
    - **element**: 'div'
    - itemtype: 'http://schema.org/NewsArticle'
  - Content:
    - **element**: 'article'
    - itemprop: 'articleBody'
    - data-type: 'story'


- Huffington Post
  - Article:
    - **element**: 'article'
    - class: '.entry.js-entry.component.loaded.entry--standard'
    - type: 'article'
  - Content:
    - **element**: 'div'
    - class: 'entry__body.js-entry-body'


- CNN
  - Article:
    - **element**: 'div'
    - class: '.l-container'
  - Content:
    - **element**: 'div'
    - class: '.pg-side-of-rail.pg-rail-tall__side'


- New York Times
  - Article:
    - **element**: 'article'
    - id: '#story'
    - class: '.story.theme-main'
  - Content:
    - **element**: 'div'
    - class: '.story-body-supplemental' **MULTIPLE DIVS**


- Fox News
  - Article:
    - **element**: 'article'
    - class: '.story article-ct'
  - Content:
    - **element**: 'div'
    - class: '.article-body'


- NBC News
  - Article:
    - **element**: 'article'
    - class: '.article_entry'
  - Content:
    - **element**: 'div'
    - class: '.article-body'


- Daily Mail
  - Article:
    - **element**: 'div'
    - id: '#js-article-text'
    - class: '.article-text'
  - Content:
    - **element**: 'div'
    - itemprop: 'articleBody'


- Washington Post
  - Article:
    - **element**: 'div'
    - id: '#pb-root'
  - Content:
    - **element**: 'article'
    - itemprop: 'articleBody'


- The Guardian
  - Article:
    - **element**: 'article'
    - id: '#article'
    - class: '.content.content--article.section-us-news.tonal.tonal--tone-news'
    - itemtype: 'http://schema.org/NewsArticle'
  - Content:
    - **element**: 'div'
    - class: '.content__article-body.from-content-api.js-article__body'
    - itemprop: 'articleBody'


- The Wall Street Journal
  - Article:
    - **element**: 'div'
    - id: '#article_sector'
    - class: '.sector'
  - Content:
    - **element**: 'div'
    - class: '.wsj-snippet-body'


- ABC News
  - Article:
    - **element**: 'article'
    - class: '.article'
  - Content:
    - **element**: 'div'
    - class: '.article-copy'


- BBC News
  - Article:
    - **element**: 'div'
    - class: '.story-body'
  - Content:
    - **element**: 'div'
    - class: '.story-body__inner'
    - property: 'articleBody'


- USA Today
  - Article:
    - **element**: 'article'
    - class: '.asset.story.clearfix'
  - Content:
    - **element**: 'div'
    - class: '.asset-double-wide.double-wide.p402_premium'
    - itemprop: 'articleBody'


- LA Times
  - Article:
    - **element**: 'article'
    - class: '.trb_ar'
    - itemtype: 'http://schema.org/Article'
  - Content:
    - **element**: 'div'
    - itemprop: 'articleBody'


- Ars Technica
  - Article:
    - **element**: 'article'
    - class: '.article-single.standalone.intro-default'
    - itemtype: 'http://schema.org/NewsArticle'
  - Content:
    - **element**: 'div'
    - class: '.article-content.post-page'
    - itemprop: 'articleBody'


- TechCrunch
  - Article:
    - **element**: 'article'
    - class: '.article lc'
  - Content:
    - **element**: 'div'
    - class: '.article-entry.text'


- Mashable
  - Article:
    - **element**: 'article'
    - class: '.blueprint.full.post.story'
  - Content:
    - **element**: 'section'
    - class: '.article-content.blueprint'


- The Next Web
  - Article:
    - **element**: 'article'
    - class: '.post'
  - Content:
    - **element**: 'div'
    - class: '.post-body.fb-quotable.u-m-3'


- Engadget
  - Article:
    - **element**: 'article'
    - class: '.c-gray-1'
  - Content:
    - **element**: 'div'
    - class: '.article-text.c-gray-1'


- Techradar
  - Article:
    - **element**: 'article'
    - class: '.news-article'
    - itemtype: 'http://schema.org/NewsArticle'
  - Content:
    - **element**: 'div'
    - id: '#article-body'
    - class: '.text-copy.bodyCopy.auto'
    - itemprop: 'articleBody'


- Firstpost Tech
  - Article:
    - **element**: 'div'
    - class: '.ybrdm'
  - Content:
    - **element**: 'div'
    - class: '.b20open.MT15.articleBody'
    - itemprop: 'articleBody'
