const saito = require('./saito');
const Big = require('big.js');


class GoldenTicket {

  constructor(app) {
    this.app = app || {};
  }


  validate(previous_block_hash, random_hash, publickey, difficulty) {

    if (previous_block_hash === "") { previous_block_hash = "00000000000000000000000000000000"; }

    let solution = this.app.crypto.hash(previous_block_hash+random_hash+publickey);
    let leading_zeroes_required = Math.floor(difficulty/16);
    let final_digit = 15 - (difficulty%16);

    //
    // create our target hash
    //
    let target_hash = "";
    for (let i = 0; i < 64; i++) {
      if (i < leading_zeroes_required) {
        target_hash += "0";
      } else {
        if (i == leading_zeroes_required) {
	  target_hash += final_digit.toString(16);
	} else {
	  target_hash += "F";
	}
      }
    }

    //
    // anything lower than target hash acceptable
    //
    for (let i = 0; i < leading_zeroes_required+1 && i < 64; i++) {
      if (parseInt(solution[i], 16) > parseInt(target_hash[i], 16)) { return false; }
    }

    //
    // if we hit here, true
    //
    return true;

  }

  serialize(target_hash, random_hash) {


    let th = Buffer.from(target_hash, 'hex');
    let rh = Buffer.from(random_hash, 'hex');
    let cr = Buffer.from(this.app.crypto.fromBase58(this.app.wallet.returnPublicKey()), 'hex');
console.log("serializing th: " + target_hash);
    return new Uint8Array([
       ...th,
       ...rh,
       ...cr,
    ]);
  }

  deserialize(buffer) {
    let target_hash = buffer.slice(0, 32).toString('hex');
    let random_hash = buffer.slice(32, 64).toString('hex');
    let creator = buffer.slice(64, 97).toString('hex');
console.log("reconstructing th: " + target_hash);
    return { target_hash : target_hash , random_hash : random_hash , creator : creator };
  }

  deserializeFromTransaction(transaction) {
    return this.deserialize(transaction.transaction.m);
  }

}

module.exports = GoldenTicket;

