this.importStrategyCard("politics", {
  name: "Politics",
  rank: 3,
  img: "/strategy/3_POLITICS.png",
  text: "<b>Player</b> picks new Speaker and gains 2 action cards.<hr /><b>Others</b> may purchase action cards.",
  strategyPrimaryEvent: function (imperium_self, player, strategy_card_player) {
    //
    // card player goes for primary
    //
    if (imperium_self.game.player === strategy_card_player && player == strategy_card_player) {
      //
      // two action cards
      //
      imperium_self.addMove("resolve\tstrategy");
      imperium_self.addMove("gain\t" + imperium_self.game.player + "\taction_cards" + "\t" + 2);
      imperium_self.addMove("DEAL\t2\t" + imperium_self.game.player + "\t2");
      imperium_self.addMove(
        "NOTIFY\t" + imperium_self.returnFaction(player) + " gains action cards"
      );
      imperium_self.addMove("strategy\t" + "politics" + "\t" + strategy_card_player + "\t2");
      imperium_self.addMove("resetconfirmsneeded\t" + imperium_self.game.state.players_info.length);

      //
      // pick the speaker
      //
      let factions = imperium_self.returnFactions();
      let html = `<div class="status-message">Make which player the speaker?</div><ul>`;
      for (let i = 0; i < imperium_self.game.state.players_info.length; i++) {
        html +=
          '<li class="option" id="' +
          i +
          '">' +
          factions[imperium_self.game.state.players_info[i].faction].name +
          "</li>";
      }
      html += "</ul>";
      imperium_self.updateStatus(html);

      let chancellor = imperium_self.game.player;
      let selected_agendas = [];

      $(".option").off();
      $(".option").on("click", function () {
        let chancellor = parseInt($(this).attr("id")) + 1;
        let laws = imperium_self.returnAgendaCards();
        let laws_selected = 0;

        //
        // if New Byzantium is unoccupied, we skip the voting stage
        //
        imperium_self.playerAcknowledgeNotice(
          "You will receive two action cards once other players have decided whether to purchase action cards.",
          function () {
            imperium_self.addMove("change_speaker\t" + chancellor);
            imperium_self.endTurn();
          }
        );
        return 0;
      });
    }
  },

  strategySecondaryEvent: function (imperium_self, player, strategy_card_player) {
    if (imperium_self.game.player == player) {
      if (
        imperium_self.game.player != strategy_card_player &&
        imperium_self.game.state.players_info[player - 1].strategy_tokens > 0
      ) {
        imperium_self.playerBuyActionCards(2);
      } else {
        imperium_self.addMove("resolve\tstrategy\t1\t" + imperium_self.getPublicKey());
        imperium_self.addPublickeyConfirm(this.publicKey, 1);
        imperium_self.endTurn();
      }
    }
  },

  strategyTertiaryEvent: function (imperium_self, player, strategy_card_player) {
    let selected_agendas = [];
    let laws = imperium_self.returnAgendaCards();
    let laws_selected = 0;

    if (imperium_self.game.player === imperium_self.game.state.speaker) {
      let html = "";
      if (imperium_self.game.state.agendas_per_round == 1) {
        html += "Select one agenda to advance for consideration in the Galactic Senate.<ul>";
      }
      if (imperium_self.game.state.agendas_per_round == 2) {
        html += "Select two agendas to advance for consideration in the Galactic Senate.<ul>";
      }
      if (imperium_self.game.state.agendas_per_round == 3) {
        html += "Select three agendas to advance for consideration in the Galactic Senate.<ul>";
      }

      for (i = 0; i < 3 && i < imperium_self.game.state.agendas.length; i++) {
        html +=
          '<li class="option" id="' +
          imperium_self.game.state.agendas[i] +
          '">' +
          laws[imperium_self.game.state.agendas[i]].name +
          "</li>";
      }
      html += "</ul>";

      imperium_self.updateStatus(html);

      let card_removal_function = function (cardkey) {
        laws_selected--;
        for (let z = 0; z < selected_agendas.length; z++) {
          if (selected_agendas[z] === cardkey) {
            selected_agendas.splice(z, 1);
          }
        }
      };

      let card_selection_function = function (cardkey) {
        laws_selected++;

        selected_agendas.push(cardkey);

        if (laws_selected >= imperium_self.game.state.agendas_per_round) {
          $(this).hide();
          imperium_self.hideAgendaCard(selected_agendas[selected_agendas.length - 1]);
          imperium_self.agenda_selection_overlay.hide();

          for (i = 1; i >= 0; i--) {
            if (imperium_self.game.state.agenda_voting_order === "simultaneous") {
              imperium_self.addMove("resolve_agenda\t" + selected_agendas[i]);
              imperium_self.addMove("post_agenda_stage_post\t" + selected_agendas[i]);
              imperium_self.addMove("post_agenda_stage\t" + selected_agendas[i]);
              imperium_self.addMove("simultaneous_agenda\t" + selected_agendas[i] + "\t" + i);
              imperium_self.addMove(
                "resetconfirmsneeded\t" + imperium_self.game.state.players_info.length
              );
              imperium_self.addMove("pre_agenda_stage_post\t" + selected_agendas[i]);
              imperium_self.addMove("pre_agenda_stage\t" + selected_agendas[i]);
              imperium_self.addMove(
                "resetconfirmsneeded\t" + imperium_self.game.state.players_info.length
              );
            } else {
              imperium_self.addMove("resolve_agenda\t" + selected_agendas[i]);
              imperium_self.addMove("post_agenda_stage_post\t" + selected_agendas[i]);
              imperium_self.addMove("post_agenda_stage\t" + selected_agendas[i]);
              imperium_self.addMove("agenda\t" + selected_agendas[i] + "\t" + i);
              imperium_self.addMove("pre_agenda_stage_post\t" + selected_agendas[i]);
              imperium_self.addMove("pre_agenda_stage\t" + selected_agendas[i]);
              imperium_self.addMove(
                "resetconfirmsneeded\t" + imperium_self.game.state.players_info.length
              );
            }
          }
          imperium_self.addMove("resetagenda");
          imperium_self.endTurn();
        }
      };

      console.log("SELECTED AGENDAS: " + JSON.stringify(selected_agendas));
      console.log("SELECTEABLE AGENDAS: " + JSON.stringify(imperium_self.game.state.agendas));

      imperium_self.agenda_selection_overlay.render(
        imperium_self.game.state.agendas,
        selected_agendas,
        imperium_self.game.state.agendas_per_round,
        function (cardkey) {
          card_selection_function(cardkey);
        },
        card_removal_function
      );

      // this doesn't trigger overlays, as those are divs not li
      $("li.option").off();
      $("li.option").on("mouseenter", function () {
        let s = $(this).attr("id");
        imperium_self.showAgendaCard(s);
      });
      $("li.option").on("mouseleave", function () {
        let s = $(this).attr("id");
        imperium_self.hideAgendaCard(s);
      });
      $("li.option").on("click", function () {
        $(".option").off();
        let cardkey = $(this).attr("id");
        card_selection_function(cardkey);
      });
    } else {
      imperium_self.updateStatus("Speaker selecting Agendas for consideration by Senate");
    }
  },
});



