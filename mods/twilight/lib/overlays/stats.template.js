module.exports = (twilight_self, stats) => {

    let us_bg = 0;
    let ussr_bg = 0;
    let round_us_vp = [];
    let round_ussr_vp = [];

    for (let z = 0; z < 10; z++) {
      if (z > twilight_self.game.state.stats.round.length) {
        round_us_vp[z] = "-";
        round_ussr_vp[z] = "-";
      } else {
        if (z == twilight_self.game.state.stats.round.length) {
          round_us_vp[z] = twilight_self.game.state.stats.us_scorings;
          round_ussr_vp[z] = twilight_self.game.state.stats.ussr_scorings;
        } else {
          round_us_vp[z] = twilight_self.game.state.stats.round[z].us_scorings;
          round_ussr_vp[z] = twilight_self.game.state.stats.round[z].ussr_scorings;
        }
      }
    }

    for (var i in twilight_self.countries) {
      let countryname = i;
      if (twilight_self.countries[countryname].bg == 1) {
        if (twilight_self.isControlled("us", i) == 1) {
          us_bg++;
        } 
        if (twilight_self.isControlled("ussr", i) == 1) {
          ussr_bg++;
        }
      }   
    }     

    let us_coups = "0";
    if (twilight_self.game.state.stats.us_coups.length > 0) {
      us_coups = JSON.stringify(twilight_self.game.state.stats.us_coups);
    }

    let ussr_coups = "0";
    if (twilight_self.game.state.stats.ussr_coups.length > 0) {
      ussr_coups = JSON.stringify(twilight_self.game.state.stats.ussr_coups);
    }


  let html = `

<div class="statistics-overlay">
    <div class="gobal-stats-grid">
      <div class="us-global-title">US</div>
      <div class="us-global-stats global-desc-ops">${stats.us_ops}</div>
      <div class="us-global-stats global-desc-ops-modified">${stats.us_modified_ops}</div>
      <div class="us-global-stats global-desc-space">${stats.us_ops_spaced}</div>
      <div class="us-global-stats global-desc-scoring">${stats.us_scorings}</div>
      <div class="us-global-stats global-desc-bg">${us_bg}</div>
      <div class="us-global-stats global-desc-roll">${us_coups}</div>
      <div class="ussr-global-title">USSR</div>
      <div class="ussr-global-stats global-desc-ops">${stats.ussr_ops}</div>
      <div class="ussr-global-stats global-desc-ops-modified">${stats.ussr_modified_ops}</div>
      <div class="ussr-global-stats global-desc-space">${stats.ussr_ops_spaced}</div>
      <div class="ussr-global-stats global-desc-scoring">${stats.ussr_scorings}</div>
      <div class="ussr-global-stats global-desc-bg">${ussr_bg}</div>
      <div class="ussr-global-stats global-desc-roll">${ussr_coups}</div>
      <div class="global-desc global-desc-ops">OPS</div>
      <div class="global-desc global-desc-ops-modified">Modified</div>
      <div class="global-desc global-desc-space">Spaced</div>
      <div class="global-desc global-desc-scoring">Scoring Cards</div>
      <div class="global-desc global-desc-bg">Battlegrounds</div>
      <div class="global-desc global-desc-roll">Coups</div>
    </div>
    <div class="round-stats-grid">
      <div class="hdr title">VP</div>
      <div class="empty"></div>
      <div class="hdr us">US</div>
      <div class="hdr ussr">USSR</div>
      <div class="hdr round1">R1</div>
      <div class="hdr round2">R2</div>
      <div class="hdr round3">R3</div>
      <div class="hdr round4">R4</div>
      <div class="hdr round5">R5</div>
      <div class="hdr round6">R6</div>
      <div class="hdr round7">R7</div>
      <div class="hdr round8">R8</div>
      <div class="hdr round9">R9</div>
      <div class="hdr round10">R10</div>
      <div class="nhdr round1 round_us">${round_us_vp[0]}</div>
      <div class="nhdr round2 round_us">${round_us_vp[1]}</div>
      <div class="nhdr round3 round_us">${round_us_vp[2]}</div>
      <div class="nhdr round4 round_us">${round_us_vp[3]}</div>
      <div class="nhdr round5 round_us">${round_us_vp[4]}</div>
      <div class="nhdr round6 round_us">${round_us_vp[5]}</div>
      <div class="nhdr round7 round_us">${round_us_vp[6]}</div>
      <div class="nhdr round8 round_us">${round_us_vp[7]}</div>
      <div class="nhdr round9 round_us">${round_us_vp[8]}</div>
      <div class="nhdr round10 round_us">${round_us_vp[9]}</div>
      <div class="nhdr round1 round_ussr">${round_ussr_vp[0]}</div>
      <div class="nhdr round2 round_ussr">${round_ussr_vp[1]}</div>
      <div class="nhdr round3 round_ussr">${round_ussr_vp[2]}</div>
      <div class="nhdr round4 round_ussr">${round_ussr_vp[3]}</div>
      <div class="nhdr round5 round_ussr">${round_ussr_vp[4]}</div>
      <div class="nhdr round6 round_ussr">${round_ussr_vp[5]}</div>
      <div class="nhdr round7 round_ussr">${round_ussr_vp[6]}</div>
      <div class="nhdr round8 round_ussr">${round_ussr_vp[7]}</div>
      <div class="nhdr round9 round_ussr">${round_ussr_vp[8]}</div>
      <div class="nhdr round10 round_ussr">${round_ussr_vp[9]}</div>
    </div>      
</div>

  `;

  return html;

}

