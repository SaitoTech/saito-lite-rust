const VPTemplate = require('./vp.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class VPOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);

	this.help = [

	  `First Turn Scoring`

		,

	  `The Early Game`

		,

	  `The Mid-Game`

		,

	  `The Late Game`

	];
	
	this.advice = [

	  `The Reformation starts and the Protestants begin converting spaces in Germany. The Papacy is well
	   ahead on the board, but as the Protestant religion spreads their their lead will narrow. Focus on 
	   "publishing treatises" and holding "debates" to spread your ideas. Translating the New Testament 
	   into German is also an excellent move.`
		,

	  `Once the Protestants control 12 spaces the Schmalkaldic League can form if its card is played (if 
	   unplayed, the league will form automatically at the end of the 4th round). At this point Protestant 
	   spaces in Germany will become Protestant home spaces and the Protestants will gain 2 VP per 
	   electorate they control. Convert those electorates now in preparation!`

		,

	  `With the Schmalkaldic League in play, the Protestants must now battle the Hapsburgs (militarily) 
	   as well as the Papacy (theologically). You may also spread religious conflict out of Germany and
	   across Europe. Conversion attempts will soon get more difficult.`

	 	,

	  `Victory goes to whichever power is in the lead at the end of the 9th round, or whichever power 
	   secures an 8 VP lead by end-of-turn scoring in any earlier round.`

	];

    }
 
    pullHudOverOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex+1;
        this.mod.hud.zIndex = overlay_zindex+1;
      }
    }

    pushHudUnderOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex-2;
        this.mod.hud.zIndex = overlay_zindex-2;
      }
    }
  
    hide() {
        this.visible = false;
        this.overlay.hide();
    }
    render() {

	if (this.mod.game.player === this.mod.returnPlayerCommandingFaction("papacy")) {

	  this.advice = [

	  `The Reformation starts and the Protestants begin converting spaces in Germany. The Papacy should
	   focus on containing the initial spread of Protestantism in Europe, or take advantage of its early
	   lead to expand its control of keys in Italy for the extra VP points.`

		,

	  `Once the Protestants control 12 spaces the Schmalkaldic League can form if its card is played (if 
	   unplayed, the league will form automatically at the end of the 4th round). The Papacy will find it
	   easier to slow the Protestant menace after that if the Protestants are not in control of all of the
	   electorates in Germany.`

		,

	  `With the Schmalkaldic League in play, the Papacy and Hapsburgs may work together to contain the 
	   Protestants both militarily as well as theologically. Religious conflict will spread across 
	   Europe, but the Papacy will soon find counter-reformations easier to carry-out.`

	 	,

	  `Victory goes to whichever power is in the lead at the end of the 9th round, or whichever power 
	   secures an 8 VP lead by end-of-turn scoring in any earlier round.`

  	  ];

	}


	this.visible = true;
        this.overlay.show(VPTemplate());

	let vp = this.mod.calculateVictoryPoints();

        for (let i in vp) {
	  let html = `
	    <div>
	      <div class="title">${this.mod.returnFactionName(vp[i].faction)}</div>
	      <div class="desc">${vp[i].vp_base} VP base + ${vp[i].vp_special} special VP + ${vp[i].vp_bonus} bonus VP</div>
	      <div class="vp">${vp[i].vp} VP</div>
	    </div>
	  `;
	  this.app.browser.addElementToSelector(html, '.vp-overlay .factions');
	}

	let advice_index = 1;

	if (this.mod.game.state.round == 1) {
	  advice_index = 0;
	}
	if (this.mod.game.state.schmalkaldic_league == 1) {
	  advice_index = 2;
	}
	if (this.mod.game.state.round >= 5) {
	  advice_index = 3;
	}

        this.app.browser.addElementToSelector(this.advice[advice_index], '.vp-overlay .help');
        this.app.browser.addElementToSelector(this.advice[advice_index], '.vp-overlay .advice');

	this.pullHudOverOverlay();

    }

}

module.exports = VPOverlay;

