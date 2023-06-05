const SettlersStatsOverlayTemplate = require("./stats.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class StatsOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.dice_count = [];
  }

  render() {
    
    this.overlay.show(SettlersStatsOverlayTemplate(this));

    this.createVPStats();
    this.createHistogram();
    this.attachEvents();

  }

  attachEvents() {
  }

  createHistogram(){
    let highest_count =  this.mod.game.stats.dice[2];
    // get highest count
    for (let i = 2; i <= 12; i++){
      if (this.mod.game.stats.dice[i] > highest_count) {
        highest_count = this.mod.game.stats.dice[i];
      }
    }

    // height for 1 count; max: 10rem
    let base_height = 10/highest_count;

    for (let i = 2; i <= 12; i++){
      let bar_height = base_height*this.mod.game.stats.dice[i];
      document.querySelector('.dice-'+i).style.height = bar_height+'rem';
      document.querySelector('.dice-'+i+' .settlers-dice-count').innerHTML = this.mod.game.stats.dice[i];

      if (bar_height == 0) {
        document.querySelector('.dice-'+i).style.border = 'none';        
        document.querySelector('.dice-'+i+' .settlers-dice-count').innerHTML = '';
      }
    }
  }

  createVPStats(){
    let card_dir = "/settlers/img/cards/";
    let statshtml = ``;
    statshtml += `<div class="settlers-achievements-container">`;
    for (let i = 1; i <= this.mod.game.state.players.length; i++) {
      //
      // player vp achievements
      //

      let player = this.mod.game.state.players[i];

      let vp = this.createCityVp(i);
      statshtml += `<div class="settlers-stats-player">Player ${i} (VP: ${vp.score})</div>`;

      statshtml += `<div class="settlers-achievements-row">`;
        statshtml += vp.html;

        statshtml += `<div class="achievements">`;
        
        //Victory Point Card Tokens -- should move to VP track
        if (this.mod.game.state.players[i - 1].vpc > 0) {
          statshtml += `<div class="victory_point_cards">`;
          for (let j = 0; j < this.mod.game.state.players[i - 1].vpc; j++) {
            statshtml += `<div class="victory_point_card">${this.mod.vp.img}</div>`;
          }
          statshtml += `<div class="victory_point_card_points vproundel">${this.mod.game.state.players[i - 1].vpc}</div>`
          statshtml += `</div>`;
        }

        if (this.mod.game.state.largestArmy.player == i) {
          statshtml += `<div class="token army largest" title="${this.mod.largest.name}">`;
        } else {
          statshtml += `<div class="token army" title="${this.mod.largest.name}">`;
        }
        for (let j = 0; j < this.mod.game.state.players[i - 1].knights; j++) {
          statshtml += this.mod.s.img;
        }
        if (this.mod.game.state.largestArmy.player == i) {
          statshtml += `<div class="army_knights vproundel">2</div>`
        }
        statshtml += `</div>`;

        if (this.mod.game.state.longestRoad.player == i) {
          statshtml += `<div class="token longest-road" title="${this.mod.longest.name}">${this.mod.longest.svg}`
          statshtml += `<div class="army_knights vproundel">2</div>`
          statshtml += `</div>`;
        }


        statshtml += `</div>`;

      statshtml += `</div>`;
    }

    statshtml += `</div>`;
    document.querySelector('.settlers-vp-race-body').innerHTML = statshtml;
  }

  createCityVp(player){
    let html = ``;
    let ranking_scores = [this.mod.game.state.players[0].vp];
    let ranking_players = [0];
    for (let i = 1; i < this.mod.game.state.players.length; i++){
      let j = 0;
      for (; j < ranking_scores.length; j++){
        if (this.mod.game.state.players[i].vp > ranking_scores[j]){
          break;
        }
      }
      ranking_scores.splice(j,0,this.mod.game.state.players[i].vp);
      ranking_players.splice(j,0,i);
    }
    for (let i = 0; i < ranking_scores.length; i++){
      if (player == i+1) {
        let player = ranking_players[i];
        let numVil = 0;
        let numCity = 0;
        for (let j = 0; j < this.mod.game.state.cities.length; j++) {
          if (this.mod.game.state.cities[j].player === player + 1) {
            if (this.mod.game.state.cities[j].level == 1){
              numVil++;
            }else{
              numCity++;
            }
          }
        }

        html += `<div class="victory_point_cards"><img src="/settlers/img/icons/village.png"> <div class="army_knights vproundel">${numVil}</div></div>
                 <div class="victory_point_cards"><img src="/settlers/img/icons/city.png"> <div class="army_knights vproundel">${numCity}</div></div>
              `;
      }
    }

    return {html: html, score: ranking_scores[player-1]};
  }

}

module.exports = StatsOverlay;

