
    ////////////////
    // PROTESTANT //
    ////////////////
    this.importDebater('luther-debater', {
      type		:	"luther-debater" ,
      name		: 	"Martin Luther",
      img		:	"LutherDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	4,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_german_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'luther-debater', html : `<li class="option" id="luther-debater">Martin Luther +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone" && his_self.canPlayerCommitDebater("protestant", "luther-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tluther-debater\t1");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tgerman");
          his_self.endTurn();
        } 
        return 0; 
      },
    });
    this.importDebater('melanchthon-debater', {
      type		:	"melanchthon-debater" ,
      name		: 	"Philip Melanchthon",
      img		:	"MelanchthonDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_german_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'melanchthon-debater', html : `<li class="option" id="melanchthon-debater">Melanchthon +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone"  && his_self.canPlayerCommitDebater("protestant", "melanchthon-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tmelanchthon-debater\t1");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tgerman");
          his_self.endTurn();
        } 
        return 0; 
      },
    });






    this.importDebater('zwingli-debater', {
      type		:	"zwingli-debater" ,
      name		: 	"Ulrich Zwingli",
      img		:	"ZwingliDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Zurich" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'zwingli-debater', html : `<li class="option" id="zwingli-debater">Ulrich Zwingli +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "zwingli-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["zurich","basel","innsbruck","strasburg","besancon","geneva","trent","salzburg","augsburg"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("ulrich_zwingli");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "ulrich_zwingli") {
	  his_self.commitDebater("protestant", "zwingli-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["zurich","basel","innsbruck","strasburg","besancon","geneva","trent","salzburg","augsburg"];
	}
        return 1;
      }
    });

    this.importDebater('bucer-debater', {
      type		:	"bucer-debater" ,
      name		: 	"Martin Bucer",
      img		:	"BucerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Strasburg" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'bucer-debater', html : `<li class="option" id="bucer-debater">Martin Bucer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "bucer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["strasburg","zurich","basel","geneva","dijon","besancon","stdizier","metz","liege","trier","mainz","nuremberg","worms","augsburg"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("martin_bucer");
	  his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "martin_bucer") {
	  his_self.commitDebater("protestant", "bucer-debater");
	  his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["strasburg","zurich","basel","geneva","dijon","besancon","stdizier","metz","liege","trier","mainz","nuremberg","worms","augsburg"];
	  his_self.game.queue.splice(qe, 1);
	  return 1;
	}
        return 1;
      }
    });
    this.importDebater('oekolampadius-debater', {
      type		:	"oekolampadius-debater" ,
      name		: 	"Johannes Oekolampadius",
      img		:	"OekolampadiusDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Basel" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'oekolampadius-debater', html : `<li class="option" id="oekolampadius-debater">Johannes Oekolampadius +1 Bonus</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation"  && his_self.canPlayerCommitDebater("protestant", "oekolampadius-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["basel","zurich","innsbruck","strasburg","besancon","geneva","turin","grenoble","lyon","dijon","metz"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("oekolampadius");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "oekolampadius") {
	  his_self.commitDebater("protestant", "oekolampdius-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["basel","zurich","innsbruck","strasburg","besancon","geneva","turin","grenoble","lyon","dijon","metz"];
	}
        return 1;
      }
    });



    this.importDebater('bullinger-debater', {
      type		:	"bullinger-debater" ,
      name		: 	"Heinrich Bullinger",
      img		:	"BullingerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Insert in 2nd round of debate in any Language Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : 'bullinger-debater', html : `<li class="option" id="bullinger-debater">substitute Bullinger</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu === "debate" && his_self.canPlayerCommitDebater("protestant", "bullinger-debater")) {
	  if (his_self.game.state.theological_debate.round === 2) {
            if (faction === "protestant") {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "debate") {
	  if (his_self.game.state.theological_debate.attacker === "papacy") {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater\tbullinger-debater");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_power\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_bonus\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tround2_defender_debater\tbullinger-debater");
	  } else {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tattacker_debater\tbullinger-debater");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_power\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tround2_attacker_debater\tbullinger-debater");
	  }
          his_self.endTurn();
        }
        return 0;
      },

    });


    this.importDebater('carlstadt-debater', {
      type		:	"carlstadt-debater" ,
      name		: 	"Andreas Carlstadt",
      img		:	"CarlstadtDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Target 3 German spaces with Treatise, unrest if fails" ,
      committed		: 	0,
      //
      // implemented in his-player, since provides +1 bonus target for publish treastise in German zone
      //
    });





    ////////////
    // PAPACY //
    ////////////
    this.importDebater('cajetan-debater', {
      type		:	"cajetan-debater" ,
      name		: 	"Thomas Cajetan",
      img		:	"CajetanDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"Target 3 spaces with burn books" ,
      committed		: 	0,
      //
      // ability implemented in his-player.js burnBooks
      //
    });
    this.importDebater('caraffa-debater', {
      type		:	"caraffa-debater" ,
      name		: 	"Carlo Caraffa",
      img		:	"CaraffaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Target 3 spaces in any zone with burn books" ,
      committed		: 	0,
      //
      // ability implemented in his-player.js burnBooks
      //
    });


    this.importDebater('eck-debater', {
      type		:	"eck-debater" ,
      name		: 	"Johann Eck",
      img		:       "EckDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in Debate Attacks" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });
    this.importDebater('gardiner-debater', {
      type		:	"gardiner-debater" ,
      name		: 	"Stephen Gardiner",
      img		:	"GardinerDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in debate in English zone if attacker" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });

    this.importDebater('aleander-debater', {
      type		:	"aleander-debater" ,
      name		: 	"Hieronymus Aleander",
      img		:       "AleanderDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"If concludes debate, winner flips an extra space" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic - note, can benefit protestants too
      //
    });

    this.importDebater('campeggio-debater', {
      type		:	"campeggio-debater" ,
      name		: 	"Lorenzo Campeggio",
      img		:	"CampeggioDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Roll die after debate loss; if 5 or 6 result is ignored" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });





    this.importDebater('loyola-debater', {
      type		:	"loyola-debater" ,
      name		: 	"Ignatius Loyola",
      img		:	"LoyolaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	4 ,
      ability		:	"Found Jesuit University for only 2 CP" ,
      committed		: 	0,
      //
      // implemented in his-player -- foundJesuitUniversityWithLoyola
      //
    });

    this.importDebater('pole-debater', {
      type		:	"pole-debater" ,
      name		: 	"Reginald Pole",
      img		:	"PoleDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Papacy if at Council of Trent" ,
      committed		: 	0,
    });

    this.importDebater('tetzel-debater', {
      type		:	"tetzel-debater" ,
      name		: 	"Johann Tetzel ",
      img		:	"TetzelDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"1 CP to Saint Peters with Burn Books" ,
      committed		: 	0,
      //
      // implemented in his_player
      //
    });






    this.importDebater('canisius-debater', {
      type		:	"canisius-debater" ,
      name		: 	"Peter Canisius",
      img		:	"CanisiusDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Counter-Reformation attempts within 2 spaces of Regensburg" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'canisius-debater', html : `<li class="option" id="canisius-debater">Peter Canisius +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "canisius-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player && ["regensburg","prague","vienna","linz","graz","salzburg","innsbruck","augsburg","worms","nuremberg","leipzig","mainz","kassal"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("peter_canisius");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "peter_canisius") {
	  his_self.commitDebater("papacy", "canisius-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;
	  his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = ["regensburg","prague","vienna","linz","graz","salzburg","innsbruck","augsburg","worms","nuremberg","leipzig","mainz","kassal"];
        }
        return 1;
      }
    });





    this.importDebater('contarini-debater', {
      type		:	"contarini-debater" ,
      name		: 	"Gasparo Contarini",
      img		:	"ContariniDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"+1 die for Counter-Reformations within 2 spaces of Charles V" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'contarini-debater', html : `<li class="option" id="contarini-debater">Gasparo Contarini +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "contarini-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
	    let cx = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	    if (cx) {
	      let targets = [];
	      if (his_self.spaces[cx]) {
	        targets.push(cx);

	        for (let i = 0; i < his_self.spaces[cx].neighbours.length; i++) {

		  let x = his_self.spaces[cx].neighbours[i];
		  if (!targets.includes(x)) { targets.push(x); }

	          for (let ii = 0; ii < his_self.spaces[x].neighbours.length; ii++) {
		    let y = his_self.spaces[x].neighbours[ii];
		    if (!targets.includes(y)) { targets.push(y); }
	  	  }
	        }
	      }
	      if (targets.includes(spacekey)) {
                return 1;
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("gasparo_contarini");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "gasparo_contarini") {
	  his_self.commitDebater("papacy", "contarini-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;

          let cx = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
          if (his_self.spaces[cx]) {
            let targets = [];
            targets.push(cx);

            for (let i = 0; i < his_self.spaces[cx].neighbours.length; i++) {

              let x = his_self.spaces[cx].neighbours[i];
              if (!targets.includes(x)) { targets.push(x); }

              for (let ii = 0; ii < his_self.spaces[x].neighbours.length; ii++) {
                let y = his_self.spaces[x].neighbours[ii];
                if (!targets.includes(y)) { targets.push(y); }
              }
            }
          }

          his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = targets;
        }
        return 1;
      }
    });

    this.importDebater('faber-debater', {
      type		:	"faber-debater" ,
      name		: 	"Peter Faber",
      img		:	"FaberDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+2 die for Counter-Reformations against an Electorate" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'faber-debater', html : `<li class="option" id="faber-debater">Peter Faber +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "faber-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
	    if (["augsburg","trier","cologne","wittenberg","mainz","brandenburg"].includes(spacekey)) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("peter_faber");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "peter_faber") {
	  his_self.commitDebater("papacy", "faber-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;
	  his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = ["augsburg","trier","cologne","wittenberg","mainz","brandenburg"];
        }
        return 1;
      }
    });






    ////////////
    // FRENCH //
    ////////////
    this.importDebater('calvin-debater', {
      type		:	"calvin-debater" ,
      name		: 	"John Calvin",
      img		:	"CalvinDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	4 ,
      ability		:	"Target 3 French-speaking spaces with a treatise" ,
      committed		: 	0,
      //
      // implemented in his-player
      //
    });

    this.importDebater('cop-debater', {
      type		:	"cop-debater" , 
     name		: 	"Nicolas Cop",
      img		:	"CopDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Paris" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'cop-debater', html : `<li class="option" id="cop-debater">Nicholas Cop +1 Roll</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "cop-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player && ["paris","stdizier","dijon","orleans","rouen","boulogne","stquentin","calais","brussels","metz","besancon","lyon","tours","nantes"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("nicholas_cop");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "nicholas_cop") {
          his_self.commitDebater("protestant", "cop-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["paris","stdizier","dijon","orleans","rouen","boulogne","stquentin","calais","brussels","metz","besancon","lyon","tours","nantes"];
        }
        return 1;
      }
    });

    this.importDebater('farel-debater', {
      type		:	"farel-debater" ,
      name		: 	"William Farel",
      img		:	"FarelDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Geneva" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'farel-debater', html : `<li class="option" id="farel-debater">William Farel +1 Roll</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "farel-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player && ["geneva","besancon","basel","strasburg","zurich","metz","dijon","lyon","orleans","limoges","avignon","grenoble","turin","milan","pavia","genoa"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("william_farel");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "william_farel") {
          his_self.commitDebater("protestant", "farel-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["geneva","besancon","basel","strasburg","zurich","metz","dijon","lyon","orleans","limoges","avignon","grenoble","turin","milan","pavia","genoa"];
        }
        return 1;
      }

    });

    this.importDebater('olivetan-debater', {
      type		:	"olivetan-debater" ,
      name		: 	"Pierre Robert Olivetan",
      img		:	"OlivetanDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Bonus CP for translation in French Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_french_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'olivetan-debater', html : `<li class="option" id="olivetan-debater">Olivetan +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_french_language_zone"  && his_self.canPlayerCommitDebater("protestant", "olivetan-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_french_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tolivetan-debater\t1");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tfrench");
          his_self.endTurn();
          his_self.updateStatus("acknowledge");
        } 
        return 0; 
      },
    });





    /////////////
    // ENGLISH //
    /////////////
    this.importDebater('cranmer-debater', {
      type		:	"cranmer-debater" ,
      name		: 	"Thomas Cranmer",
      img		:	"CranmerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation within 2 spaces of London" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'cranmer-debater', html : `<li class="option" id="cranmer-debater">Thomas Cranmer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "cranmer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["london","portsmouth","norwich","plymouth","bristol","wales","shrewsbury","carlisle","york","lincoln"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("thomas_cranmer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "thomas_cranmer") {
	  his_self.commitDebater("protestant", "cranmer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["london","portsmouth","norwich","plymouth","bristol","wales","shrewsbury","carlisle","york","lincoln"];
	}
        return 1;
      }
    });

    this.importDebater('wishart-debater', {
      type		:	"wishart-debater" ,
      name		: 	"George Wishart",
      img		:	"WishartDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in Scotland" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'wishart-debater', html : `<li class="option" id="wishart-debater">George Wishart +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "wishart-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["stirling","glasgow","edinburgh"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("george_wishart");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "george_wishart") {
	  his_self.commitDebater("protestant", "wishart-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["stirling","glasgow","edinburgh"];
	}
        return 1;
      }
    });

    this.importDebater('latimer-debater', {
      type		:	"latimer-debater" ,
      name		: 	"Hugh Latimer",
      img		:	"LatimerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in England" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'latimer-debater', html : `<li class="option" id="latimer-debater">Hugh Latimer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "latimer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("hugh_latimer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "hugh_latimer") {
	  his_self.commitDebater("protestant", "latimer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich"];
	}
        return 1;
      }
    });

    this.importDebater('knox-debater', {
      type		:	"knox-debater" ,
      name		: 	"John Knox",
      img		:	"KnoxDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 die for Reformation Attempts in England or Scotland" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'knox-debater', html : `<li class="option" id="knox-debater">John Knox +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "knox-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich","glasgow","edinburgh","stirling"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("john_knox");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "john_knox") {
	  his_self.commitDebater("protestant", "knox-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich","glasgow","edinburgh","stirling"];
	}
        return 1;
      }
    });


    this.importDebater('tyndale-debater', {
      type		:	"tyndale-debater" ,
      name		: 	"William Tyndale",
      img		:	"TyndaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_english_language_zone") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'tyndale-debater', html : `<li class="option" id="tyndale-debater">William Tyndale +1 Bonus CP</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone"  && his_self.canPlayerCommitDebater("protestant", "tyndale-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      }, 
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\ttyndale-debater\t1");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tenglish");
          his_self.endTurn();
        }
        return 0;
      },
    });

    this.importDebater('coverdale-debater', {
      type		:	"coverdale-debater" ,
      name		: 	"Myles Coverdale",
      img		:	"CoverdaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_english_language_zone") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'coverdale-debater', html : `<li class="option" id="coverdale-debater">Myles Coverdale +1 Bonus CP</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone"  && his_self.canPlayerCommitDebater("protestant", "coverdale-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      }, 
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tcoverdale-debater\t1");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tenglish");
          his_self.endTurn();
        }
        return 0;
      },
    });

