module.exports = ImperiumRulesOverlayTemplate = (imperium_self, player, faction_name) => {

  return `

  <div style="" class="faction_sheet_container p1 bc1">
    <div id="faction_main" class="faction_main">

      <div id="faction_sheet_empire_title" class="faction_sheet_empire_title">
        <div class="faction_sheet_empire_title_name">${faction_name}</div>
        <div class="faction_sheet_token_box" id="faction_sheet_token_box">
          <div class="faction_sheet_token_box_title">Command</div>
          <div class="faction_sheet_token_box_title">Strategy</div>
          <div class="faction_sheet_token_box_title">Fleet</div>
          <div>
            <span class="fa-stack fa-3x">
            <span class="fa fa-stack-1x">
            <span class="token_count commend_token_count">
            ${imperium_self.game.state.players_info[player - 1].command_tokens}
            </span>
            </span>
            </span>
          </div>
          <div>
            <span class="fa-stack fa-3x">
            <span class="fa fa-stack-1x">
            <span class="token_count strategy_token_count">
            ${imperium_self.game.state.players_info[player - 1].strategy_tokens}
            </span>
            </span>
            </span>
          </div>
          <div>
            <span class="fa-stack fa-3x">
            <span class="fa fa-stack-1x">
            <span class="token_count fleet_supply_count">
            ${imperium_self.game.state.players_info[player - 1].fleet_supply}
            </span>
            </span>
            </span>
          </div>
        </div>
      </div>

      <div class="faction_sheet_action_card_box" id="faction_sheet_action_card_box">
      </div>

      <div class="faction_sheet_tech_box" id="faction_sheet_tech_box">
      </div>


      <div class="faction_sheet_planet_card_box" id="faction_sheet_planet_card_box">
      </div>

    </div>

    <div id="faction_sidebar" class="faction_sidebar">

      <div id="faction_abilities_container" class="faction_abilities_container"></div>
      <div id="faction_tech_container" class="faction_tech_container"></div>

    </div>

  </div>

  `;

}
