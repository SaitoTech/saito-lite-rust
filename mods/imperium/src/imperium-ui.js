



/////////////////
/// HUD MENUS ///
/////////////////
hideOverlays() {
  document.querySelectorAll('.overlay').forEach(el => {
    el.classList.add('hidden');
  });
}

handleMovementMenuItem() {
  this.movement_overlay.render();
}
handleCombatMenuItem() {
  this.combat_overlay.render();
}
handleFactionMenuItem() {
  this.factions_overlay.render();
}
handleHowToPlayMenuItem() {
  this.rules_overlay.render();
}
handleTechMenuItem() {
  this.tech_tree_overlay.render();
}

handleAgendasMenuItem() {

  let cards = [];
  let laws = this.returnAgendaCards();
      
  for (let i = 0; i < this.game.state.agendas.length; i++) {
    cards.push(laws[this.game.state.agendas[i]]);
  }   
      
  if (cards.length == 0) {
    alert("No Upcoming Agendas");
    return;
  }

  this.agenda_overlay.render(cards);
      
}
      
handleLawsMenuItem() {

  let laws = this.returnAgendaCards();
  let cards = [];

  for (let i = 0; i < this.game.state.laws.length; i++) {
    cards.push(laws[this.game.state.laws[i].agenda]);
  }   
   
  if (cards.length == 0) {
    alert("No Laws in Force");
    return;
  }

  this.agenda_overlay.render(cards);
      
}     
        
handleUnitsMenuItem() {
  this.overlay.show(this.returnUnitsOverlay());
  let imperium_self = this;
  $('#close-units-btn').on('click', function() {
    imperium_self.overlay.hide();
  });
}

handleObjectivesMenuItem() {

  let cards = [];
  let imperium_self = this;

  //
  // MY SECRET OBJECTIVES
  //
  for (let i = 0; i < imperium_self.game.deck[5].hand.length; i++) {
    if (!imperium_self.game.state.players_info[imperium_self.game.player - 1].objectives_scored.includes(imperium_self.game.deck[5].hand[i])) {
      let obj = imperium_self.secret_objectives[imperium_self.game.deck[5].hand[i]];
      cards.push(obj);
    }
  }

  //
  // STAGE 1 OBJECTIVES
  //
  for (let i = 0; i < this.game.state.stage_i_objectives.length; i++) {
    let obj = this.stage_i_objectives[this.game.state.stage_i_objectives[i]];
    cards.push(obj);
  }

  //
  // STAGE 2 OBJECTIVES
  //
  for (let i = 0; i < this.game.state.stage_ii_objectives.length; i++) {
    let obj = this.stage_ii_objectives[this.game.state.stage_ii_objectives[i]];
    cards.push(obj);
  }

  //
  // OTHERS SECRET OBJECTIVES
  //
  for (let i = 0; i < this.game.state.players_info.length; i++) {
    if (i > 0) { html += '<p></p>'; }
    let objc = imperium_self.returnPlayerObjectivesScored((i+1), ["secret_objectives"]);
    for (let o in objc) {
      cards.push(objc[i]);
    }
  }

  this.objectives_overlay.render(cards);

}
handleInfoMenuItem() {
  if (document.querySelector('.gameboard').classList.contains('bi')) {
    for (let i in this.game.sectors) {
      this.removeSectorHighlight(i);
      document.querySelector('.gameboard').classList.remove('bi');
    }
  } else {
    for (let i in this.game.sectors) {
      this.addSectorHighlight(i);
      document.querySelector('.gameboard').classList.add('bi');
    }
  }
}
handleSystemsMenuItem() {

  let imperium_self = this;
  let factions = this.returnFactions();

  this.activated_systems_player++;

  if (this.activated_systems_player > this.game.state.players_info.length) { this.activated_systems_player = 1; }

  salert(`Showing Systems Activated by ${factions[this.game.state.players_info[this.activated_systems_player - 1].faction].name}`);

  $('.hex_activated').css('background-color', 'transparent');
  $('.hex_activated').css('opacity', '0.3');

  for (var i in this.game.board) {
    if (this.game.sectors[this.game.board[i].tile].activated[this.activated_systems_player - 1] == 1) {
      let divpid = "#hex_activated_" + i;
      $(divpid).css('background-color', 'var(--p' + this.activated_systems_player + ')');
      $(divpid).css('opacity', '0.3');
    }
  }
}




