
const util = require('../lib/util')

describe('Utils suite', function () {

  it('should parse link pathnames correctly', function () {
    util.urlPath('https://github.com/croqaz/clean-mark').should.equal('clean-mark')
    util.urlPath('https://github.com/croqaz/clean-mark/').should.equal('clean-mark')
  })

  it('should parse link domains correctly', function () {
    util.urlPath('https://gatherthepeople.com').should.equal('gatherthepeople.com')
    util.urlPath('https://gatherthepeople.com/').should.equal('gatherthepeople.com')
  })

})
