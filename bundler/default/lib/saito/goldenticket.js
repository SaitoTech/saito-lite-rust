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

}

module.exports = GoldenTicket;

