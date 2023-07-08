
  displayDebaters() {
    this.debaters_overlay.render();
  }

  displayExplorers() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      html += `	<div class="personage_tile${i}" data-id="${this.game.state.explorers[i].img}" style="background-image:url('/his/img/tiles/explorers/${this.game.state.explorers[i].img}')"></div>`;
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

    for (let i = 0; i < this.game.state.explorers.length; i++) {
      let tile_f = "/his/img/tiles/explorers/" + this.game.state.explorers[i].img;
      let tile_b = tile_f.replace('.svg', '_back.svg');
      if (this.game.state.explorers[i].committed == 1) {
	let x = tile_f;
	tile_f = tile_b;
	tile_b = x;
      }
      let divsq = `.personage_tile${i}`;
      $(divsq).mouseover(function() {
	$(this).css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$(this).css('background-image', `url('${tile_f}')`);
      });
    }

  }

  displayConquistadors() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      html += `	<div class="personage_tile personage_tile${i}" data-id="${this.game.state.conquistadors[i].img}" style="background-image:url('/his/img/tiles/conquistadors/${this.game.state.conquistadors[i].img}')"></div>`;
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      let tile_f = "/his/img/tiles/conquistadors/" + this.game.state.conquistadors[i].img;
      let tile_b = tile_f.replace('.svg', '_back.svg');
      if (this.game.state.conquistadors[i].committed == 1) {
	let x = tile_f;
	tile_f = tile_b;
	tile_b = x;
      }
      let divsq = `.personage_tile${i}`;
      $(divsq).mouseover(function() {
	$(this).css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$(this).css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebater(debater, attacker=true) {

    let tile_f = "/his/img/tiles/debaters/" + this.debaters[debater].img;
    let tile_b = tile_f.replace('.svg', '_back.svg');

    if (attacker) {
      $('.attacker_debater').css('background-image', `url('${tile_f}')`);
      $('.attacker_debater').mouseover(function() { 
	$('.attacker_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.attacker_debater').css('background-image', `url('${tile_f}')`);
      });
    } else {
      $('.defender_debater').css('background-image', `url('${tile_f}')`);
      $('.defender_debater').mouseover(function() { 
	$('.defender_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.defender_debater').css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebate(res) {
    this.debate_overlay.render(res);
  }


  displayReligiousConflictSheet() {

    let num_protestant_spaces = 0;
    let rcc = this.returnReligiousConflictChart();
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }
    let cid = "s" + num_protestant_spaces;

    let html = `
      <div class="religious_conflict_sheet" id="religious_conflict_sheet" style="background-image: url('/his/img/reference/religious.jpg')">
	<div class="religious_conflict_sheet_tile" id="religious_conflict_sheet_tile"></div>
	<div class="papal_debaters"></div>
	<div class="lutheran_debaters"></div>
	<div class="calvinist_debaters"></div>
	<div class="anglican_debaters"></div>
	<div class="protestant_debaters"></div>
      </div>
    `;

    this.overlay.showOverlay(html);

    //
    // list all debaters
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let dtile = `<img class="debater_tile" id="${i}" src="/his/img/tiles/debaters/${d.img}" />`;
      if (d.owner === "papacy") {
	this.app.browser.addElementToSelector(dtile, '.papal_debaters');
      }
      if (d.owner === "england") {
	this.app.browser.addElementToSelector(dtile, '.anglican_debaters');
      }
      if (d.owner === "hapsburg") {
	this.app.browser.addElementToSelector(dtile, '.calvinist_debaters');
      }
      if (d.owner === "protestant") {
	this.app.browser.addElementToSelector(dtile, '.protestant_debaters');
      }
    }

    let obj = document.getElementById("religious_conflict_sheet_tile");
    obj.style.top = rcc[cid].top;
    obj.style.left = rcc[cid].left;

  }

  returnProtestantSpacesTrackVictoryPoints() {

    let num_protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }

    let x = [];
    for (let i = 0; i < 51; i++) { 

      x[i] = {}; x[i].protestant = 0; x[i].papacy = 15;

      if (i >= 4) { x[i].protestant++; x[i].papacy--; }
      if (i >= 7) { x[i].protestant++; x[i].papacy--; }
      if (i >= 10) { x[i].protestant++; x[i].papacy--; }
      if (i >= 14) { x[i].protestant++; x[i].papacy--; }
      if (i >= 17) { x[i].protestant++; x[i].papacy--; }
      if (i >= 20) { x[i].protestant++; x[i].papacy--; }
      if (i >= 24) { x[i].protestant++; x[i].papacy--; }
      if (i >= 27) { x[i].protestant++; x[i].papacy--; }
      if (i >= 30) { x[i].protestant++; x[i].papacy--; }
      if (i >= 34) { x[i].protestant++; x[i].papacy--; }
      if (i >= 37) { x[i].protestant++; x[i].papacy--; }
      if (i >= 40) { x[i].protestant++; x[i].papacy--; }
      if (i >= 44) { x[i].protestant++; x[i].papacy--; }
      if (i >= 47) { x[i].protestant++; x[i].papacy--; }
      if (i >= 50) { x[i].protestant+=100; x[i].papacy--; }
    }

    return x[num_protestant_spaces];

  }


  displayFactionSheet(faction) {
    this.faction_overlay.render(faction);
  }

  returnFactionSheetKeys() {
  }

  displayBoard() {
    try {
      this.displayColony();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayConquest();
    } catch (err) {
      console.log("error displaying conquest... " + err);
    }
    try {
      this.displayElectorateDisplay();
    } catch (err) {
      console.log("error displaying electorates... " + err);
    }
    try {
      this.displayNewWorld();
    } catch (err) {
      console.log("error displaying new world... " + err);
    }
    try {
      this.displaySpaces();
    } catch (err) {
      console.log("error displaying spaces... " + err);
    }
    try {
      this.displayNavalSpaces();
    } catch (err) {
      console.log("error displaying naval spaces... " + err);
    }
    try {
      this.displayVictoryTrack();
    } catch (err) {
      console.log("error displaying victory track... " + err);
    }
  }

  displayColony() {
  }

  displayConquest() {
  }

  displayNewWorld() {
  }

  displaySpaceDetailedView(name) {
    // function is attached to this.spaces not this.game.spaces
    let html = this.spaces[name].returnView();    
    this.overlay.show(html);
  }

  displayElectorateDisplay() {
    let elecs = this.returnElectorateDisplay();
    for (let key in elecs) {
      let obj = document.getElementById(`ed_${key}`);
      let tile = this.returnSpaceTile(this.game.spaces[key]);
      obj.innerHTML = ` <img class="hextile" src="${tile}" />`;      
      if (this.returnElectoralBonus(key)) {
        obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-${this.returnElectoralBonus(key)}.svg" />`;
      }
    }
  }


  // returns 1 if the bonus for controlling is still outstanding
  returnElectoralBonus(space) {

    if (space === "augsburg" && this.game.state.augsburg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "mainz" && this.game.state.augsburg_electoral_bonus == 0) {
      return 1;
    }
    if (space === "trier" && this.game.state.trier_electoral_bonus == 0) {
      return 1;
    }
    if (space === "cologne" && this.game.state.cologne_electoral_bonus == 0) {
      return 1;
    }
    if (space === "wittenberg" && this.game.state.wittenberg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "brandenburg" && this.game.state.brandenburg_electoral_bonus == 0) {
      return 1;
    }

    return 0;

  }

  returnSpaceTile(space) {

    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";
    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    if (owner != "") {
      if (owner === "hapsburg") {
        tile = "/his/img/tiles/hapsburg/";	  
        if (space.religion === "protestant") {
          tile += `Hapsburg_${stype}_back.svg`;
        } else {
          tile += `Hapsburg_${stype}.svg`;
        }
      }
      if (owner === "england") {
        tile = "/his/img/tiles/england/";	  
        if (space.religion === "protestant") {
          tile += `England_${stype}_back.svg`;
        } else {
          tile += `England_${stype}.svg`;
        }
      }
      if (owner === "france") {
        tile = "/his/img/tiles/france/";	  
        if (space.religion === "protestant") {
          tile += `France_${stype}_back.svg`;
        } else {
          tile += `France_${stype}.svg`;
        }
      }
      if (owner === "papacy") {
        tile = "/his/img/tiles/papacy/";	  
        if (space.religion === "protestant") {
          tile += `Papacy_${stype}_back.svg`;
	} else {
	  tile += `Papacy_${stype}.svg`;
	}
      }
      if (owner === "protestant") {
        tile = "/his/img/tiles/protestant/";	  
        if (space.religion === "protestant") {
          tile += `Protestant_${stype}_back.svg`;
        } else {
          tile += `Protestant_${stype}.svg`;
        }
      }
      if (owner === "ottoman") {
        tile = "/his/img/tiles/ottoman/";	  
        if (space.religion === "protestant") {
          tile += `Ottoman_${stype}_back.svg`;
        } else {
          tile += `Ottoman_${stype}.svg`;
        }
      }
      if (owner === "independent") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "hungary") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "scotland") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "venice") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "genoa") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
    }

    return tile;

  }

  returnNavies(space) {

    let html = '<div class="space_navy" id="">';
    let tile = "";

    for (let z in space.units) {

      let squadrons = 0;
      let corsairs = 0;

      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "squadron") {
	  squadrons += 2;
	}
	if (space.units[z][zz].type === "corsair") {
	  corsairs += 1;
	}
      }

      while (squadrons >= 2) {
        if (z === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (squadrons >= 2) {
            tile += `Hapsburg_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (squadrons >= 2) {
            tile += `English_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (squadrons >= 2) {
            tile += `French_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
	  if (squadrons >= 2) {
            tile += `Papacy_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (squadrons >= 2) {
            tile += `Ottoman_squadron.svg`;
	    squadrons -= 2;
          }
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        if (z === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (squadrons >= 2) {
            tile += `Venice_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (squadrons >= 2) {
            tile += `Genoa_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "scotland") {
          tile = "/his/img/tiles/scotland/";	  
	  if (squadrons >= 2) {
            tile += `Scottish_squadron.svg`;
	    squadrons -= 2;
          }
        }

        html += `<img class="navy_tile" src="${tile}" />`;
      }

 
      while (corsairs >= 1) {
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        html += `<img class="navy_tile" src="${tile}" />`;
      }
 
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnArmies(space) {

    let html = '<div class="space_army" id="">';

    let tile = "";

    for (let z in space.units) {

      let army = 0;
      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "regular") {
	  army++;
	}
      }

      while (army >= 1) {
        if (z === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (army >= 4) {
            tile += `HapsburgReg-4.svg`;
	    army -= 4;
	  } else {
	    if (army >= 2) {
              tile += `HapsburgReg-2.svg`;
	      army -= 2;
	    } else {
	      if (army >= 1) {
                tile += `HapsburgReg-1.svg`;
	        army -= 1;
	      }
	    }
          }
	}
        if (z === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (army >= 4) {
            tile += `EnglandReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `EnglandReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `EnglandReg-1.svg`;
	        army -= 1;
              }
            }
	  }
        }
        if (z === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (army >= 4) {
            tile += `FrenchReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `FrenchReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `FrenchReg-1.svg`;
	        army -= 1;
              }
	    }
	  }
        }
        if (z === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
          if (army >= 4) {
            tile += `PapacyReg-4.svg`;
            army -= 4;
          } else {
	    if (army >= 2) {
              tile += `PapacyReg-2.svg`;
	      army -= 2;
	    } else {
	      if (army >= 1) {
                tile += `PapacyReg-1.svg`;
	        army -= 1;
	      }
	    }
	  }
        }
        if (z === "protestant") {
          tile = "/his/img/tiles/protestant/";	  
	  if (army >= 4) {
            tile += `ProtestantReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `ProtestantReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `ProtestantReg-1.svg`;
	        army -= 1;
              }
	    }
          }
        }
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (army >= 4) {
            tile += `OttomanReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `OttomanReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `OttomanReg-1.svg`;
	        army -= 1;
              }
            }
          }
        }
        if (z === "independent") {
          tile = "/his/img/tiles/independent/";	  
	  if (army >= 2) {
            tile += `IndependentReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `IndependentReg-1.svg`;
	      army -= 1;
            } 
	  }
        }
        if (z === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (army >= 2) {
            tile += `VeniceReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `VeniceReg-1.svg`;
	      army -= 1;
            }
	  }
        }
        if (z === "hungary") {
          tile = "/his/img/tiles/hungary/";	  
	  if (army >= 4) {
            tile += `HungaryReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `HungaryReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `HungaryReg-1.svg`;
	        army -= 1;
              }
            }
          }
        }
        if (z === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (army >= 2) {
            tile += `GenoaReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `GenoaReg-1.svg`;
	      army -= 1;
            }
          }
        }
        if (z === "scotland") {
          tile = "/his/img/tiles/scotland/";	  
	  if (army >= 2) {
            tile += `ScottishReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `ScottishReg-1.svg`;
	      army -= 1;
            }
          } 
        }
      }

      if (tile !== "") {
        html += `<img class="army_tile" src="${tile}" />`;
      } 

    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }


  returnMercenaries(space) {

    let html = '<div class="space_mercenaries" id="">';
    let tile = "";

    for (let z in space.units) {

      let army = 0;
      for (let zz = 0; zz < space.units[z].length; zz++) {
        if (space.units[z][zz].type === "mercenary") {
          army++;
        }
      }

      for (let i = 0; i < army; i+= 2) {
        if (z != "") {
          if (z === "hapsburg") {
            tile = "/his/img/tiles/hapsburg/";	  
	    if (army >= 4) {
              tile += `HapsburgMerc-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `HapsburgMerc-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `HapsburgMerc-1.svg`;
	      army -= 1;
	    }
          }
          if (z === "england") {
            tile = "/his/img/tiles/england/";	  
	    if (army >= 4) {
              tile += `EnglandMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `EnglandMerc-2.svg`;
	      army -= 4;
            }
	    if (army >= 1) {
              tile += `EnglandMerc-1.svg`;
	      army -= 1;
            }
          }
          if (z === "france") {
            tile = "/his/img/tiles/france/";	  
	    if (army >= 4) {
              tile += `FrenchMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `FrenchMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `FrenchMerc-1.svg`;
	      army -= 1;
            }
          }
          if (z === "papacy") {
            tile = "/his/img/tiles/papacy/";	  
	    if (army >= 4) {
              tile += `PapacyMerc-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `PapacyMerc-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `PapacyMerc-1.svg`;
	      army -= 1;
	    }
          }
          if (z === "protestant") {
            tile = "/his/img/tiles/protestant/";	  
	    if (army >= 4) {
              tile += `ProtestantMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `ProtestantMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `ProtestantMerc-1.svg`;
	      army -= 1;
            }
          }
          if (z === "ottoman") {
            tile = "/his/img/tiles/ottoman/";	  
	    if (army >= 4) {
              tile += `OttomanMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `OttomanMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `OttomanMerc-1.svg`;
	      army -= 1;
            }
          }
        }
        html += `<img class="mercenary_tile" src="${tile}" />`;
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnPersonages(space) {

    let html = '<div class="figures_tile" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";

    for (let z in space.units) {
      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].debater === true) {
          html += `<img src="/his/img/tiles/debater/${space.units[z][zz].img}" />`;
	  tile = html;
	}
	if (space.units[z][zz].personage === true) {
          html += `<img src="/his/img/tiles/personages/${space.units[z][zz].img}" />`;
	  tile = html;
	}
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  displaySpace(key) {

    if (!this.game.spaces[key]) { return; }

    let space = this.game.spaces[key];
    let tile = this.returnSpaceTile(space);

    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //
    if (space.political == space.home) { show_tile = 0; }
    if (space.political === "") { show_tile = 0; }

    //
    // and force for keys
    //
    if (space.home === "" && space.political !== "") { show_tile = 1; }
    if (space.type === "key") { show_tile = 1; }

    //
    // and force if has units
    //
    for (let key in space.units) {
      if (space.units[key].length > 0) {
	show_tile = 1; 
      }
    }

    //
    // sanity check
    //
    if (tile === "") { show_tile = 0; }

    let t = "."+key;
    document.querySelectorAll(t).forEach((obj) => {

      obj.innerHTML = "";

      if (show_tile === 1) {
        obj.innerHTML = `<img class="${stype}tile" src="${tile}" />`;
        obj.innerHTML += this.returnArmies(space);
        obj.innerHTML += this.returnNavies(space);
        obj.innerHTML += this.returnMercenaries(space);
        obj.innerHTML += this.returnPersonages(space);
      }

      if (this.isSpaceInUnrest(space)) {
        obj.innerHTML += `<img class="unrest" src="/his/img/tiles/unrest.svg" />`;
      }
      if (this.isBesieged(space)) {
        obj.innerHTML += `<img class="seige" src="/his/img/tiles/seige.png" />`;
      }

    });

  }

  displayNavalSpace(key) {

    if (!this.game.navalspaces[key]) { return; }

    let obj = document.getElementById(key);
    let space = this.game.navalspaces[key];

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //

    if (show_tile === 1) {
      obj.innerHTML += this.returnNavies(space);
      obj.innerHTML += this.returnPersonages(space);
    }

  }

  displayNavalSpaces() {

    //
    // add tiles
    //
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key]) {
	this.displayNavalSpace(key);
        document.getElementById(key).onclick = (e) => {
	  this.displayNavalSpaceDetailedView(key);
        }
      }
    }

  }

  displaySpaces() {

    let his_self = this;


    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
	this.displaySpace(key);
        document.getElementById(key).onclick = (e) => {
	  this.displaySpaceDetailedView(key);
        }
      }
    }

    let xpos = 0;
    let ypos = 0;

if (!his_self.bound_gameboard_zoom) {

    $('.gameboard').on('mousedown', function (e) {
      if (e.currentTarget.classList.contains("space")) { return; }
      xpos = e.clientX;
      ypos = e.clientY;
    });
    $('.gameboard').on('mouseup', function (e) { 
      if (e.currentTarget.classList.contains("space")) { return; }
      if (Math.abs(xpos-e.clientX) > 4) { return; }
      if (Math.abs(ypos-e.clientY) > 4) { return; }
      his_self.theses_overlay.renderAtCoordinates(xpos, ypos);
    });

    his_self.bound_gameboard_zoom = 1;

}


  }


  displayVictoryTrack() {

    let factions_and_scores = this.calculateVictoryPoints();

    let x = this.returnVictoryPointTrack();

    for (f in factions_and_scores) {
      let total_vp = factions_and_scores[f].vp;
      let ftile = f + "_vp_tile";
      obj = document.getElementById(ftile);
      obj.style.left = x[total_vp.toString()].left + "px";
      obj.style.top = x[total_vp.toString()].top + "px";
      obj.style.display = "block";
    }

  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deckidx = -1;
    let card;

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/his/img/cards/PASS.png" />`;
    }

    //
    //
    //
    if (this.debaters[cardname]) { return this.debaters[cardname].returnCardImage(); }

    for (let i = 0; i < this.game.deck.length; i++) {
      var c = this.game.deck[i].cards[cardname];
      if (c == undefined) { c = this.game.deck[i].discards[cardname]; }
      if (c == undefined) { c = this.game.deck[i].removed[cardname]; }
      if (c !== undefined) { 
	deckidx = i;
        card = c;
      }
    }


    if (deckidx === -1) {
      //
      // this is not a card, it is something like "skip turn" or cancel
      //
      return `<div class="noncard" id="${cardname.replaceAll(" ","")}">${cardname}</div>`;
    }

    var html = `<img class="${cardclass}" src="/his/img/${card.img}" />`;

    //
    // add cancel button to uneventable cards
    //
    if (deckidx == 0) { 
      if (!this.deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }
    if (deckidx == 1) { 
      if (!this.diplomatic_deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }

    return html

  }


  displayDebaterPopup(debater) {
    
  }

