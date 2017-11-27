
const fs = require('fs')
const clean = require('../lib/clean')

describe('Readability Test suite', function () {

  it('Local html files', function (done) {
    const promises = []
    process.stdout.write('  ')
    for (const dir of fs.readdirSync('test/fixtures')) {
      if (dir[0] === '.') continue
      const wanted = JSON.parse(fs.readFileSync(`test/fixtures/${dir}/expected.json`, 'utf8'))
      const p = clean(`test/fixtures/${dir}/source.htm`)
      .then(res => {
        res.author.should.equal(wanted.author)
        res.title.should.equal(wanted.title)
        for (const m of wanted.matches) {
          res.text.should.containEql(m)
        }
      })
      process.stdout.write('.')
      promises.push(p)
    }
    Promise.all(promises)
      .then(() => {
        console.log(` ${promises.length} local websites are OK\n`)
        done()
      })
      .catch(e => done(e))
  })

  it('Article from FreeCodeCamp.com', function (done) {
    clean('https://medium.freecodecamp.com/the-12-youtube-videos-new-developers-mention-the-most-f2d1fce337ca')
      .then(res => {
        res.text.should.containEql('The freeCodeCamp community generates gigabytes of data each week')
        res.text.should.containEql('good summary of what Regular Expressions are')
        res.text.should.containEql('why you need to apply to as many jobs as possible')
        res.text.should.containEql('some of the nonprofit projects built by freeCodeCamp alumni')
        done()
      }).catch(e => done(e))
  })

  it('Article from TechRadar.com', function (done) {
    clean('http://www.techradar.com/news/amd-vs-intel-the-16-core-showdown', {fileType: 'text'})
      .then(res => {
        res.text.should.containEql('The past few years have seen something of a plateau')
        res.text.should.containEql('AMD Ryzen Threadripper 1950X')
        res.text.should.containEql('Intel Core i9-7960X')
        done()
      }).catch(e => done(e))
  })

  it('Article from Yahoo News', function (done) {
    clean('https://www.yahoo.com/news/tomb-drawing-shows-mongoose-leash-142300393.html')
    .then(res => {
      res.text.should.containEql('A mongoose on a leash, a colorful pelican and various bats are just a few')
      res.text.should.containEql('researchers are recording and analyzing additional creatures')
      res.text.should.containEql('not as hot and dry.')
      done()
    }).catch(e => done(e))
  })
})
