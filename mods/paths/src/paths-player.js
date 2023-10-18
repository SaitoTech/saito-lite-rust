
  returnPlayers(num = 0) {

    var players = [];
    return players;

  }

  returnPlayerHand() {
    return this.game.deck[this.game.player-1].hand;
  }

  returnPlayerName(faction="") {
    if (faction == "central") { return "Central Powers"; }
    return "Allies";
  }

  returnPlayerOfFaction(faction="") {
    if (faction == "central") { return 1; }
    return 2;
  }

  playerPlayCard(faction, card) {

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    html    += `<li class="card" id="ops">ops (movement / combat)</li>`;
    html    += `<li class="card" id="sr">strategic redeployment</li>`;
    html    += `<li class="card" id="rp">replacement points</li>`;
    html    += `<li class="card" id="event">trigger event</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Playing ${this.popup(card)}`, html, true);
    this.bindBackButtonFunction(() => { this.playerTurn(faction); });
    this.attachCardboxEvents((action) => {

      if (action === "ops") {
	alert("ops");
	this.playerPlayOps(faction, card, card.ops);
      }

      if (action === "sr") {
	alert("sr");
	this.playerPlayStrategicRedeployment(faction, card, card.rp);
      }

      if (action === "rp") {
	alert("rp");
	this.playerPlayReplacementPoints(faction, card);
      }

      if (action === "event") {
	alert("event");
      }

    });

  }

  playerPlayOps(faction, card, cost) {

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    html    += `<li class="card" id="movement">activate for movement</li>`;
    html    += `<li class="card" id="combat">activate for combat</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`You have ${cost} OPS remaining`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {

      if (action === "movement") {
	alert("movement");
      }

      if (action === "combat") {
	alert("combat");
      }

    });

  }

  playerPlayReplacementPoints(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    for (let key in c.sr) {
      html    += `<li class="card" id="${key}">${key} - ${c.sr[key]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Add Strategic Redeployments:`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {
      this.addMove("rp\tfaction\t${action}\t${c.sr[key]}");
      this.endTurn();
    });

  }

  playerPlayStrategicRedeployment(faction, value) {
    this.addMove(`sr\t${faction}\t${value}`);
    this.endTurn();
  }

  playerPlayEvent(faction, card) {

  }

  playerTurn(faction) {

    let name = this.returnPlayerName(faction);
    let hand = this.returnPlayerHand();

    this.updateStatusAndListCards(`${name}: pick a card`, hand);
    this.attachCardboxEvents((card) => {
      this.playerPlayCard(faction, card);
    });

  }


