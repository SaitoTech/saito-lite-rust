/**********************************************************************************
 *
 * GAME CARDS
 *
 * This file contains all card-related functions, such as returning cards or 
 * calculating their width/height, etc.
 *
 *********************************************************************************/

class GameCards {

  isFaceDown(card){
    return false;
  }

  returnCardHeight(card_width = 1) {
    return card_width * this.card_height_ratio;
  }

  returnCardList(cardarray = [], deckid = 0) {

    if (cardarray.length === 0) {
      cardarray = this.game.deck[deckid].hand; //Keys to the deck object
    }

    if (cardarray.length === 0) {
      console.warn("No cards to render...");
      return "";
    }

    let html = "";
    if (this.interface === 2) {
      //text
      for (i = 0; i < cardarray.length; i++) {
        html += this.returnCardItem(cardarray[i], deckid);
      }
      return html;
    } else {
      for (i = 0; i < cardarray.length; i++) {
        html += `<div id="${cardarray[i]}" class="card ${cardarray[i]}">${this.returnCardImage(
          cardarray[i],
          deckid
        )}</div>`;
      }
      return html;
    }
  }


  returnCardItem(card, deckid = 0) {
    card = card.replace(/ /g, "").toLowerCase();
    let c = this.game.deck[deckid].cards[card];

    //Fallback (try discard/remove piles and other decks if card not found)
    for (let z = 0; c == undefined && z < this.game.deck.length; z++) {
      c = this.game.deck[z].cards[cardname];
      if (c == undefined) {
        c = this.game.deck[z].discards[cardname];
      }
      if (c == undefined) {
        c = this.game.deck[z].removed[cardname];
      }
    }

    if (c) {
      return `<li class="card" id="${card}">${c.name}</li>`;
    } else {
      return `<li class="card noncard" id="${card}">card not found</li>`;
    }
  }

  returnCardImage(cardname, deckid = null) {
    let c = null;
    if (deckid == null) {
      for (let i = 0; i < this.game.deck.length; i++) {
        c = this.game.deck[i].cards[cardname];
        if (c) {
          deckid = i;
          break;
        }
      }
    }

    if (c == null) {
      for (let z = 0; c == null && z < this.game.deck.length; z++) {
        c = this.game.deck[z].cards[cardname];
        if (c == undefined) {
          c = this.game.deck[z].discards[cardname];
        }
        if (c == undefined) {
          c = this.game.deck[z].removed[cardname];
        }
      }
    }

    //
    // this is not a card, it is something like "skip turn" or cancel
    //
    if (c == null) {
      // if this is an object, it might have a returnCardImage() function attached
      // that will give us what we need. try before bailing.
      if (typeof cardname === "object" && !Array.isArray(cardname) && cardname != null) {
        if (cardname.returnCardImage != null) {
          let x = cardname.returnCardImage();
          if (x) {
            return x;
          }
        }
      }
      return '<div class="noncard">' + cardname + "</div>";
    }

    if (typeof c === "string") {
      cardname = c;
      c = this.card_library[cardname];
    }

    let suggested_img = this.returnSlug() + "/img/";
    if (c.img?.indexOf(suggested_img) != -1) {
      return `<img class="cardimg" id="${cardname}" src="${c.img}" />`;
    }
    return `<img class="cardimg" id="${cardname}" src="/${this.returnSlug()}/img/${c.img}" />`;
  }

  //
  // returns discarded cards and removes them from discard pile
  //
  returnDiscardedCards(deckidx = 1) {

    var discarded = {};
    deckidx = parseInt(deckidx - 1);

    for (var i in this.game.deck[deckidx].discards) {
      discarded[i] = this.game.deck[deckidx].cards[i];
      delete this.game.deck[deckidx].cards[i];
    }

    this.game.deck[deckidx].discards = {};

    return discarded;
  }

  removeCardFromHand(card, moveToDiscard = false) {
    for (let z = 0; z < this.game.deck.length; z++) {
      for (i = 0; i < this.game.deck[z].hand.length; i++) {
        if (this.game.deck[z].hand[i] === card) {
          if (moveToDiscard) {
            this.game.deck[z].discards[card] = this.game.deck[z].cards[card];
          }
          this.game.deck[z].hand.splice(i, 1);
          return;
        }
      }
    }
  }

  /**
   * Convert a hand (array of cards) to the html hand
   */
  handToHTML(hand) {
    let html = "<div class='htmlCards'>";
    hand.forEach((card) => {
      html += `<img class="card" src="${this.card_img_dir}/${card}.png">`;
    });
    html += "</div> ";
    return html;
  }

}

module.exports = GameCards;

