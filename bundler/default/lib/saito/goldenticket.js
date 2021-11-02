const saito = require('./saito');
const Big = require('big.js');


class GoldenTicket {

  constructor(app) {
    this.app = app || {};
  }



  validate(target_hash, random_hash, publickey, difficulty) {

    let solution = this.app.crypto.hash(random_hash+publickey);
    let difficulty_order = Math.round(parseFloat(difficulty)/parseFloat(1_0000_0000));
    let difficulty_grain = difficulty % 1_0000_0000;

console.log(solution + " --- " + difficulty_order + " --- " + difficulty_grain);

    let gtsol = parseInt(sol.slice(0,difficulty_order+1),16);
    let bksol = parseInt(blk.returnHash().slice(0,difficulty_order+1),16);

    if (gtsol >= bksol && (gtsol-bksol)/16 <= difficulty_grain) {
      return true;
    }
    return false;

  }

}

module.exports = GoldenTicket;

