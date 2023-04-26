



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
  this.overlay.show(this.returnAgendasOverlay());
}
handleLawsMenuItem() {
  this.overlay.show(this.returnLawsOverlay());
}
handleUnitsMenuItem() {
  this.overlay.show(this.returnUnitsOverlay());
  let imperium_self = this;
  $('#close-units-btn').on('click', function() {
    imperium_self.overlay.hide();
  });
}

handleObjectivesMenuItem() {
  this.overlay.show(this.returnObjectivesOverlay());
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




