var chai = require('chai')
var bufferEqual = require('buffer-equal')
var xor = require('../')

chai.should()

describe('Bitwise XOR', function () {
  it('should return the bitwise XOR of two Buffers', function (done) {
    bufferEqual(xor(new Buffer('00ff', 'hex'), new Buffer('3344', 'hex')),new Buffer('33bb','hex')).should.be.true
    done()
  })
  it('should return the bitwise XOR of two Strings', function (done) {
    bufferEqual(xor('toto', 'titi'), new Buffer('00060006','hex')).should.be.true
    done()
  })
})
