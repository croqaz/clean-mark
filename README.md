<h1 align="center">
  Clean-mark
  <br>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/clean-mark"><img src="https://img.shields.io/npm/v/clean-mark.svg" alt="npm version"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
</p>

**This tool is in alpha stage**

Convert an article into a clean Markdown text file.

> node cli.js "http://some-website.com/some-fancy-article"

The article will be automatically named using the URL path name.


Tested on all major news sites. In rare cases, some text, or links are cut from the article. In this case, you can copy & paste it manually in the resulted text.

There are more problems on Blogspot, Wordpress and other sites, where the HTML from custom themes is badly written.

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


IDEAS:

- add text stats like: nr. of words and sections, most used words
- export to clean HTML
- export to printable PDF
