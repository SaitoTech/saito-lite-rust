
  displayBoard() {

    let game_self = this;
/****
    document.getElementById("p1-lands").innerHTML = "";
    document.getElementById("p1-creatures").innerHTML = "";
    document.getElementById("p1-enchantments").innerHTML = "";

    // Player 2
    document.getElementById("p2-lands").innerHTML = "";
    document.getElementById("p2-creatures").innerHTML = "";
    document.getElementById("p2-enchantments").innerHTML = "";

    for (let i = 1; i <= 2; i++) {
      for (let z = 0; z < this.game.state.hands[i-1].lands.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].lands[z]].returnElement(game_self, i), `p${i}-lands`);
      }  
      for (let z = 0; z < this.game.state.hands[i-1].creatures.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].creatures[z]].returnElement(game_self, i), `p${i}-creatures`);
      }  
      for (let z = 0; z < this.game.state.hands[i-1].enchantments.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].enchantments[z]].returnElement(game_self, i), `p${i}-enchantments`);
      }  
    }
****/
  }



  //
  // this controls the display of the card
  //
  returnElement(game_self, player, cardkey) {

    let card = game_self.game.cards[cardkey];
    let tapped = "";
    if (card.tapped == 1) { tapped = " tapped"; }

    return `
      <div class="card ${tapped}" id="p${player}-${cardkey}">
        <img src="${card.img}" class="card-image" />
      </div>
    `;
  }


