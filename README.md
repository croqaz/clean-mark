
# Clean-mark

**This is just an experiment**.

Convert an article into a clean Markdown text file.

> node cli.js "http://some-website.com/some-fancy-article"

You can also pass the `-agro` switch, to cut more of the text.

Implementation steps:

1. Downloads the content of a web page
1. Meta-scrape page details (title, author, date, etc)
1. Sanitizes the ugly HTML
1. Minifies the disinfected HTML
1. Converts the result into clean Markdown text

Tested on Arstechnica.com, Lifehacker.com, NewAtlas.com, Techcrunch.com, TheNextWeb.com, TheVerge.com, BitcoinMagazine.com, Phandroid.com, OmgUbuntu.co.uk. In rare cases, some text paragraphs get cut from the article.

There are more problems on Blogspot and Wordpress, where the HTML is badly written.
