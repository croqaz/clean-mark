
const stats = require('../lib/stats')

const t1 = `
**§1. Real si virtual in conceptul de "persoana juridica"**

Persoana juridică este o _copie a realităţii_, şi nu o realitate materială; este o formă şi nu un organism; o abstracţiune şi nu o entitate materială sau un fapt; o entitate _juridică_ şi nu una organică (materială)!

Persoana juridică este, conform [art 25 alin 3 NCC](http://www.codulcivil.ro/art-25-subiectele-de-drept-civil/ "art. 25 alin. 3 NCC"), _o formă de organizare_ care poate fi titulară de drepturi şi de obligaţii civile doar dacă întruneşte condiţiile cerute de lege.

Persoana juridica este o realitate virtuala, o imitatie a realitatii.`

const t2 = `I like long walks on the beach`


describe('Text stats suite', function () {

  it('stats text 1', function () {
    stats.paragraphCount(t1).should.equal(4)
    stats.sentenceCount(t1).should.equal(3)
    stats.wordCount(t1).should.equal(85)
  })

  it('stats text 2', function () {
    stats.paragraphCount(t2).should.equal(1)
    stats.sentenceCount(t2).should.equal(1)
    stats.wordCount(t2).should.equal(7)
  })

})
