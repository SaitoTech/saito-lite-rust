
  if (card == "opec") {

    if (this.game.state.events.northseaoil == 1) {
      this.updateLog(`${this.cardToText(card)} prevented by ${this.cardToText("northseaoil")}`);
      return 1;
    }

    let ussr_bonus = 0;

    if (this.isControlled("ussr", "egypt") == 1)       { ussr_bonus++; }
    if (this.isControlled("ussr", "iran") == 1)        { ussr_bonus++; }
    if (this.isControlled("ussr", "libya") == 1)       { ussr_bonus++; }
    if (this.isControlled("ussr", "saudiarabia") == 1) { ussr_bonus++; }
    if (this.isControlled("ussr", "gulfstates") == 1)  { ussr_bonus++; }
    if (this.isControlled("ussr", "iraq") == 1)        { ussr_bonus++; }
    if (this.isControlled("ussr", "venezuela") == 1)   { ussr_bonus++; }

    this.game.state.vp -= ussr_bonus;
    this.updateVictoryPoints();
    this.updateLog("<span>USSR VP bonus is:</span> " + ussr_bonus);

    if (!i_played_the_card){
      if (player == "ussr"){
        this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
      }else{
        this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
      }
    }

    return 1;

  }

