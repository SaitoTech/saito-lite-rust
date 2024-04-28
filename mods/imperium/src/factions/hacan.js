this.importFaction("faction8", {
  id: "faction8",
  name: "Emirates of Hacan",
  nickname: "Hacan",
  homeworld: "sector30",
  space_units: ["carrier", "carrier", "cruiser", "fighter", "fighter"],
  ground_units: ["infantry", "infantry", "infantry", "infantry", "spacedock"],
  tech: [
    "sarween-tools",
    "antimass-deflectors",
    "faction8-merchant-class",
    "faction8-guild-ships",
    "faction8-arbiters",
    "faction8-flagship",
  ],
  background: "faction8.jpg",
  promissary_notes: ["trade", "political", "ceasefire", "throne", "faction8-promissary"],
  commodity_limit: 6,
  intro: `<div style="font-weight:bold">Welcome to Red Imperium!</div><div style="line-height:2.8rem;margin-top:10px;margin-bottom:0px;">You are playing as the Emirates of Hacan, a guild-class of traders whose political machinations play out behind the veil of ruthless commercial competition. May you trade your way to wealth and power. Good luck!</div>`,
});

this.importTech("faction8-flagship", {
  name: "Hacan Flagship",
  faction: "faction8",
  type: "ability",
  text: "Spend 1 trade good to add +1 to any dice rolled in combat",
  postShipsFireEventTriggers: function (
    imperium_self,
    player,
    attacker,
    defender,
    sector,
    combat_info
  ) {
    if (player == attacker && combat_info.attacker == player) {
      if (imperium_self.doesPlayerHaveTech(attacker, "faction8-flagship")) {
        if (imperium_self.doesSectorContainPlayerUnit(attacker, sector, "flagship")) {
          let costs_per_hit = [];
          for (let i = 0; i < combat_info.modified_roll.length; i++) {
            if (combat_info.hits_or_misses[i] == 0) {
              costs_per_hit.push(
                2 * (parseInt(combat_info.hits_on[i]) - parseInt(combat_info.modified_roll[i]))
              );
            }
          }
          if (costs_per_hit.length > 0) {
            costs_per_hit.sort((a, b) => a - b);
            if (imperium_self.game.state.players_info[attacker - 1].goods >= costs_per_hit[0]) {
              return 1;
            }
          }
        }
      }
    }
    if (player == defender && combat_info.attacker == player) {
      if (imperium_self.doesPlayerHaveTech(defender, "faction8-flagship")) {
        if (imperium_self.doesSectorContainPlayerUnit(defender, sector, "flagship")) {
          let costs_per_hit = [];
          for (let i = 0; i < combat_info.modified_roll.length; i++) {
            if (combat_info.hits_or_misses[i] == 0) {
              costs_per_hit.push(
                2 * (parseInt(combat_info.hits_on[i]) - parseInt(combat_info.modified_roll[i]))
              );
            }
          }
          if (costs_per_hit.length > 0) {
            costs_per_hit.sort((a, b) => a - b);
            if (imperium_self.game.state.players_info[defender - 1].goods >= costs_per_hit[0]) {
              return 1;
            }
          }
        }
      }
    }
    return 0;
  },
  postShipsFireEvent: function (imperium_self, player, attacker, defender, sector, combat_info) {
    if (player != imperium_self.game.player) {
      imperium_self.updateStatus("Hacan considering using Flagship Ability to modify hits...");
      return 0;
    } else {
      let costs_per_hit = [];
      for (let i = 0; i < combat_info.modified_roll.length; i++) {
        if (combat_info.hits_or_misses[i] == 0) {
          costs_per_hit.push(
            2 * (parseInt(combat_info.hits_on[i]) - parseInt(combat_info.modified_roll[i]))
          );
        }
      }
      costs_per_hit.sort((a, b) => a - b);
      let html =
        '<div class="status-message">Do you wish to boost hits with Flagship Ability?</div><ul>';
      let cumulative_cost = 0;
      let available_trade_goods = imperium_self.game.state.players_info[player - 1].goods;
      for (let i = 0; i < costs_per_hit.length && cumulative_cost <= available_trade_goods; i++) {
        cumulative_cost += costs_per_hit[i];
        html +=
          '<li class="option" id="' +
          i +
          '">' +
          (i + 1) +
          " extra hits - " +
          cumulative_cost +
          " trade goods</li>";
      }
      html += '<li class="option" id="no">skip ability</li>';
      html += "</ul>";

      imperium_self.updateStatus(html);

      $(".option").off();
      $(".option").on("click", function () {
        let id = $(this).attr("id");
        $(this).hide();

        if (id == "no") {
          imperium_self.endTurn();
          return;
        }

        let at = attacker;
        let df = defender;

        if (player == defender) {
          at = defender;
          df = attacker;
        }

        let old_hits = 0;
        let last_move = imperium_self.game.queue[imperium_self.game.queue.length - 1];
        let lmv = last_move.split("\t");
        if (lmv.length > 5) {
          if (lmv[0] === "assign_hits") {
            if (at == lmv[1]) {
              old_hits = parseInt(lmv[6]);
              imperium_self.addMove("resolve\tassign_hits");
            }
          }
        }

        imperium_self.addMove(
          "assign_hits\t" +
            at +
            "\t" +
            df +
            "\tspace\t" +
            sector +
            "\tspace\t" +
            (parseInt(id) + 1 + old_hits) +
            "\tspace_combat"
        );
        for (let i = 0; i < costs_per_hit.length; i++) {
          cumulative_cost += costs_per_hit[i];
        }
        imperium_self.addMove(
          "NOTIFY\tHacan Flagship: " +
            (parseInt(id) + 1) * 2 +
            " trade goods buys " +
            (parseInt(id) + 1) +
            " extra hits"
        );
        imperium_self.addMove("expend\t" + at + "\t" + "goods" + "\t" + (parseInt(id) + 1) * 2);
        imperium_self.endTurn();
      });
    }
    return 0;
  },
});

this.importTech("faction8-merchant-class", {
  name: "Mercantile",
  faction: "faction8",
  type: "ability",
  text: "May refresh commodities for free when Trade is played",
  initialize: function (imperium_self, player) {
    if (imperium_self.faction8_merchant_class_swapped == undefined) {
      imperium_self.faction8_merchant_class_swapped = 1;

      imperium_self.faction8_merchant_class_original_event =
        imperium_self.strategy_cards["trade"].strategySecondaryEvent;
      imperium_self.strategy_cards["trade"].strategySecondaryEvent = async function (
        imperium_self,
        player,
        strategy_card_player
      ) {
        if (
          imperium_self.doesPlayerHaveTech(player, "faction8-merchant-class") &&
          player != strategy_card_player &&
          imperium_self.game.player == player
        ) {
          //
          // skip if we are full commodities
          //
          if (
            imperium_self.game.state.players_info[player - 1].commodities ===
            imperium_self.game.state.players_info[player - 1].commodity_limit
          ) {
            imperium_self.addMove(
              "resolve\tstrategy\t1\t" + (imperium_self.getPublicKey())
            );
            imperium_self.addPublickeyConfirm(imperium_self.getPublicKey(), 1);
            imperium_self.endTurn();
            imperium_self.updateLog(
              "Hacan already refreshed, do not need to play faction ability."
            );
            return 0;
          }

          let html =
            '<div class="status-message">Do you wish to refresh your commodities free-of-charge?</div><ul>';
          html += '<li class="option" id="yes">yes, of course</li>';
          html += '<li class="option" id="no">no, perhaps not</li>';
          html += "</ul>";

          imperium_self.updateStatus(html);

          $(".option").off();
          $(".option").on("click", async function () {
            let id = $(this).attr("id");
            $(this).hide();
            if (id != "yes") {
              imperium_self.addMove(
                "resolve\tstrategy\t1\t" + (imperium_self.getPublicKey())
              );
              imperium_self.addPublickeyConfirm(imperium_self.getPublicKey(), 1);
              imperium_self.addMove(
                "purchase\t" +
                  imperium_self.game.player +
                  "\t" +
                  "commodities" +
                  "\t" +
                  imperium_self.game.state.players_info[imperium_self.game.player - 1]
                    .commodity_limit
              );
              imperium_self.endTurn();
              return;
            } else {
              imperium_self.addMove(
                "resolve\tstrategy\t1\t" + (imperium_self.getPublicKey())
              );
              imperium_self.addPublickeyConfirm(imperium_self.getPublicKey(), 1);
              imperium_self.endTurn();
            }
          });
        } else {
          imperium_self.faction8_merchant_class_original_event(
            imperium_self,
            player,
            strategy_card_player
          );
        }
      };
    }
  },
});

this.importTech("faction8-guild-ships", {
  name: "Guild Ships",
  faction: "faction8",
  type: "ability",
  text: "May trade with non-neighbours",
  gainTechnology: function (imperium_self, gainer, tech) {
    if (tech == "faction8-guild-ships") {
      imperium_self.game.state.players_info[gainer - 1].may_trade_with_non_neighbours = 1;
    }
  },
});

this.importTech("faction8-arbiters", {
  name: "Arbitrage",
  faction: "faction8",
  type: "ability",
  text: "May trade in action cards",
  gainTechnology: function (imperium_self, gainer, tech) {
    if (tech == "faction8-arbiters") {
      imperium_self.game.state.players_info[gainer - 1].may_trade_action_cards = 1;
    }
  },
});

this.importTech("faction8-production-biomes", {
  name: "Production Biomes",
  faction: "faction8",
  type: "special",
  color: "green",
  prereqs: ["green", "green"],
  text: "Spend strategy token to gain 4 trade goods. Pick a player to earn 2 trade goods.",
  initialize: function (imperium_self, player) {
    if (imperium_self.game.state.players_info[player - 1].production_biomes == undefined) {
      imperium_self.game.state.players_info[player - 1].production_biomes = 0;
      imperium_self.game.state.players_info[player - 1].production_biomes_exhausted = 0;
    }
  },
  gainTechnology: function (imperium_self, gainer, tech) {
    if (tech == "faction8-production-biomes") {
      imperium_self.game.state.players_info[gainer - 1].production_biomes = 1;
      imperium_self.game.state.players_info[gainer - 1].production_biomes_exhausted = 0;
    }
  },
  onNewRound: function (imperium_self, player) {
    if (imperium_self.doesPlayerHaveTech(player, "faction8-production-biomes")) {
      imperium_self.game.state.players_info[player - 1].production_biomes_exhausted = 0;
    }
  },
  menuOption: function (imperium_self, menu, player) {
    let x = {};
    if (menu === "main") {
      if (imperium_self.game.state.players_info[player - 1].production_biomes === 1) {
        x.event = "production_biomes";
        x.html = '<li class="option" id="production_biomes">production biomes</li>';
      }
    }
    return x;
  },
  menuOptionTriggers: function (imperium_self, menu, player) {
    if (imperium_self.doesPlayerHaveTech(player, "faction8-production-biomes") && menu === "main") {
      if (imperium_self.game.state.players_info[player - 1].strategy_tokens > 0) {
        if (imperium_self.game.state.active_player_moved == 0) {
          return 1;
        }
      }
    }
    return 0;
  },
  menuOptionActivated: function (imperium_self, menu, player) {
    if (imperium_self.game.player == player) {
      imperium_self.playerSelectPlayerWithFilter(
        "You spend 1 strategy token. You gain 4 Trade Goods. Pick player to gain 2 Trade Goods: ",
        function (player) {
          if (player.player !== imperium_self.game.player) {
            return 1;
          }
          return 0;
        },
        function (pnum) {
          // player = player number here
          imperium_self.addMove("resolve\tplay");
          imperium_self.addMove("setvar\tstate\t0\tactive_player_moved\t" + "int" + "\t" + "0");
          imperium_self.addMove("player_end_turn\t" + imperium_self.game.player);
          imperium_self.addMove("purchase\t" + pnum + "\t" + "goods" + "\t" + "2");
          imperium_self.addMove(
            "purchase\t" + imperium_self.game.player + "\t" + "goods" + "\t" + "4"
          );
          imperium_self.addMove(
            "expend\t" + imperium_self.game.player + "\t" + "strategy" + "\t" + "1"
          );
          imperium_self.addMove(
            "NOTIFY\t" +
              imperium_self.returnFaction(imperium_self.game.player) +
              " earns trade goods through production biomes"
          );
          imperium_self.endTurn();
          return 0;
        },
        null
      );
      return 0;
    }
  },
});

this.importTech("faction8-quantum-datahub-node", {
  name: "Quantum Datahub Node",
  faction: "faction8",
  type: "special",
  color: "yellow",
  prereqs: ["yellow", "yellow", "yellow"],
  text: "Spend strategy token to swap strategy cards with one player. Give them 3 trade goods.",
  initialize: function (imperium_self, player) {
    if (
      imperium_self.game.state.players_info[player - 1].faction8_quantum_datahub_node == undefined
    ) {
      imperium_self.game.state.players_info[player - 1].faction8_quantum_datahub_node = 0;
      imperium_self.game.state.players_info[player - 1].faction8_quantum_datahub_node_exhausted = 0;
    }
  },
  gainTechnology: function (imperium_self, gainer, tech) {
    if (tech == "faction8-quantum-datahub-node") {
      imperium_self.game.state.players_info[gainer - 1].faction8_quantum_datahub_node = 1;
      imperium_self.game.state.players_info[gainer - 1].faction8_quantum_datahub_node_exhausted = 0;
    }
  },
  onNewRound: function (imperium_self, player) {
    if (imperium_self.doesPlayerHaveTech(player, "faction8-quantum-datahub-node")) {
      imperium_self.game.state.players_info[player - 1].faction8_quantum_datahub_node_exhausted = 0;
    }
  },
  menuOption: function (imperium_self, menu, player) {
    let x = {};
    if (menu === "main") {
      if (imperium_self.game.state.players_info[player - 1].faction8_quantum_datahub_node === 1) {
        x.event = "quantum_datahub_node";
        x.html = '<li class="option" id="quantum_datahub_node">quantum datahub node</li>';
      }
    }
    return x;
  },
  menuOptionTriggers: function (imperium_self, menu, player) {
    if (
      imperium_self.doesPlayerHaveTech(player, "faction8-quantum-datahub-node") &&
      menu === "main"
    ) {
      if (imperium_self.game.state.players_info[player - 1].strategy_tokens > 0) {
        if (
          imperium_self.game.state.players_info[player - 1]
            .faction8_quantum_datahub_node_exhausted == 0
        ) {
          if (imperium_self.game.state.active_player_moved == 0) {
            return 1;
          }
        }
      }
    }
    return 0;
  },
  menuOptionActivated: function (imperium_self, menu, player) {
    if (imperium_self.game.player == player) {
      imperium_self.playerSelectPlayerWithFilter(
        "Steal strategy card from whom? Return one of yours and 3 trade goods",
        function (player) {
          if (player.player !== imperium_self.game.player) {
            return 1;
          }
          return 0;
        },
        function (pnum) {
          let strategy_cards = imperium_self.returnStrategyCards();

          let html = '<div>Select Strategy Card to Steal: </div><ul>"';
          for (
            let i = 0;
            i < imperium_self.game.state.players_info[pnum - 1].strategy.length;
            i++
          ) {
            let s = imperium_self.game.state.players_info[pnum - 1].strategy[i];
            html += `<li class="option" id="${i}">${strategy_cards[s].name}</li>`;
          }
          html += '<li class="option" id="skip">skip</li>';

          imperium_self.updateStatus(html);

          $(".option").off();
          $(".option").on("click", function () {
            let id = $(this).attr("id");
            $(this).hide();

            if (id == "skip") {
              imperium_self.updateLog("Hacan skips Quantum Datahub Node");
              imperium_self.endTurn();
              return;
            }

            let pull_strategy_card = imperium_self.game.state.players_info[pnum - 1].strategy[id];
            let pull_strategy_card_from = pnum;

            let html = '<div>Select Your Strategy Card to Return: </div><ul>"';
            for (
              let i = 0;
              i <
              imperium_self.game.state.players_info[imperium_self.game.player - 1].strategy.length;
              i++
            ) {
              let s =
                imperium_self.game.state.players_info[imperium_self.game.player - 1].strategy[i];
              html += `<li class="option" id="${i}">${strategy_cards[s].name}</li>`;
            }
            html += '<li class="option" id="skip">skip</li>';

            imperium_self.updateStatus(html);

            $(".option").off();
            $(".option").on("click", function () {
              let id = parseInt($(this).attr("id"));
              $(this).hide();

              let push_strategy_card =
                imperium_self.game.state.players_info[imperium_self.game.player - 1].strategy[id];

              if (id == "skip") {
                imperium_self.updateLog("Hacan skips Quantum Datahub Node");
                imperium_self.endTurn();
                return;
              }

              imperium_self.addMove(
                "setvar\tplayers\t" +
                  imperium_self.game.player +
                  "\t" +
                  "faction8_quantum_datahub_node_exhausted" +
                  "\t" +
                  "int" +
                  "\t" +
                  "1"
              );
              imperium_self.addMove(
                "give" +
                  "\t" +
                  pull_strategy_card_from +
                  "\t" +
                  imperium_self.game.player +
                  "\t" +
                  "strategy" +
                  "\t" +
                  pull_strategy_card
              );
              imperium_self.addMove(
                "give" +
                  "\t" +
                  imperium_self.game.player +
                  "\t" +
                  pull_strategy_card_from +
                  "\t" +
                  "strategy" +
                  "\t" +
                  push_strategy_card
              );
              imperium_self.addMove(
                `NOTIFY\tPlayers swap ${push_strategy_card} and ${pull_strategy_card}`
              );
              imperium_self.endTurn();
            });
          });
        }
      );

      return 0;
    }
    return 0;
  },
});

this.importPromissary("faction8-promissary", {
  name: "Trade Convoys",
  faction: -1,
  text: "Holder may negotiate transactions with non-neighbours. Return if player activates system with Hacan units",
  activateSystemTriggers: function (imperium_self, activating_player, player, sector) {
    let hacan_player = imperium_self.returnPlayerOfFaction("faction8");
    if (imperium_self.doesPlayerHavePromissary(player, "faction8-promissary")) {
      if (imperium_self.doesSectorContainPlayerUnits(hacan_player, sector)) {
        if (activating_player != hacan_player) {
          return 1;
        }
      }
    }
    return 0;
  },
  activateSystemEvent: function (imperium_self, activating_player, player, sector) {
    if (imperium_self.doesPlayerHavePromissary(player, "faction8-promissary")) {
      if (imperium_self.game.player == player) {
        let hacan_player = imperium_self.returnPlayerOfFaction("faction8");
        imperium_self.addMove(
          "give" +
            "\t" +
            player +
            "\t" +
            hacan_player +
            "\t" +
            "promissary" +
            "\t" +
            "faction8-promissary"
        );
        imperium_self.addMove(
          "NOTIFY\t" +
            imperium_self.returnFaction(player) +
            " redeems Trade Convoys (Hacan Promissary)"
        );
        imperium_self.endTurn();
      }
      return 0;
    }
    return 1;
  },
  gainPromissary: function (imperium_self, gainer, promissary) {
    if (promissary.indexOf("faction8-promissary") >= 0) {
      if (imperium_self.doesPlayerHavePromissary(gainer, "faction8-promissary")) {
        imperium_self.game.state.players_info[gainer - 1].may_trade_with_non_neighbours = 1;
      }
    }
    return 1;
  },
  losePromissary: function (imperium_self, loser, promissary) {
    if (promissary.indexOf("faction8-promissary") >= 0) {
      if (!imperium_self.doesPlayerHavePromissary(loser, "faction8-promissary")) {
        if (loser !== imperium_self.returnPlayerOfFaction("faction8")) {
          imperium_self.game.state.players_info[loser - 1].may_trade_with_non_neighbours = 0;
        }
      }
    }
    return 1;
  },
});
