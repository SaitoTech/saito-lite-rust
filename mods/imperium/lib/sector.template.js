module.exports  = (imperium_self, sector) => {
	return `
          <div class="hexIn" id="hexIn_${sector}">
            <div class="hexLink" id="hexLink_${sector}">
            <div class="hexInfo" id="hex_info_${sector}"></div>
              <div class="hex_bg" id="hex_bg_${sector}">
                <img class="hex_img sector_graphics_background ${imperium_self.game.board[sector].tile}" id="hex_img_${sector}" src="" />
                <img src="/imperium/img/frame/border_full_white.png" id="hex_img_faction_border_${sector}" class="faction_border" />
                <img src="/imperium/img/frame/border_full_yellow.png" id="hex_img_hazard_border_${sector}" class="hazard_border" />
                <div class="hex_activated" id="hex_activated_${sector}">
              </div>
                <div class="hex_space" id="hex_space_${sector}">
              </div>
                <div class="hex_ground" id="hex_ground_${sector}">
              </div>
              </div>
            </div>
          </div>
  `;
};
