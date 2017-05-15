
# Clean-mark

**This tool is in alpha stage**

Convert an article into a clean Markdown text file.

> node cli.js "http://some-website.com/some-fancy-article"

The article will be automatically named using the URL path name.


Tested on all major news sites. In rare cases, some text, or links are cut from the article. In this case, you can copy & paste it manually in the resulted text.

There are more problems on Blogspot, Wordpress and other sites, where the HTML from custom themes is badly written.


Implementation steps:

1. Downloads the content of a web page
1. Meta-scrape page details (title, author, date, etc)
1. Sanitizes the ugly HTML
1. Minifies the disinfected HTML
1. Converts the result into clean Markdown text


TODO: convert to printable PDF.
