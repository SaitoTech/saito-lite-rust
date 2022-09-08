/****************************************************************
 * 
 * An extension of the Game Engine for special games like
 * Poker or Blackjack where you want to start a game with 
 * 2 players, but have open slots on the table that other 
 * players can join at a later time. Meanwhile, players can 
 * stop playing without ending the game
 * 
 * 
 ***************************************************************/

let GameTemplate = require("./gametemplate");


class GameTableTemplate extends GameTemplate {
  constructor(app) {
    super(app);
    
    this.opengame = true; //We will use this as a flag for Arcade to distinguish between parent and child class

  }
}

module.exports = GameTableTemplate;