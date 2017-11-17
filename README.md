<h1 align="center">
  ➹ Clean-mark
  <br>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/clean-mark"><img src="https://img.shields.io/npm/v/clean-mark.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/clean-mark"><img src="https://img.shields.io/npm/dt/clean-mark.svg" alt="Downloads"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
</p>

Convert a blog article into a clean Markdown text file.


### Example

For example, this article:

[![Original article](article-screen.png)](http://www.techradar.com/news/amd-vs-intel-the-16-core-showdown)

Is converted into this text file:

![Clean text](clean-screen.png)


### Installation

Simply install with npm:

> npm install clean-mark


### Usage

> ./bin/clean-mark "http://some-website.com/some-fancy-article"

The article will be automatically named using the URL path name. In the case, above, it will be `some-fancy-article.md`.


This project depends on the [A-Extractor](https://github.com/croqaz/a-extractor) project, a database of expressions used for extracting content from blogs and articles.


### Help

Clean-mark was tested on all major news sites. On some websites, the text, or links are cut from the article.
In this case, you have to manually edit the resulted text,

AND

raise an [issue on A-Extractor](https://github.com/croqaz/a-extractor/issues) with the link that doesn't work and I'll add it in the database, so that next time, the text will be extracted correctly.

My desired goals are:

1. Good text extraction
1. More useless text is preferred, instead of wrongly cutting from the actual article
1. Extracting media (images, videos, audio) is not that important
1. Extraction speed is not that important


Implementation steps:

1. Downloads the content of a web page
1. Meta-scrape page details (title, author, date, etc)
1. Sanitizes the ugly HTML
1. Minifies the disinfected HTML
1. Converts the result into clean Markdown text

-----

### License

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT) (c) Cristi Constantin
