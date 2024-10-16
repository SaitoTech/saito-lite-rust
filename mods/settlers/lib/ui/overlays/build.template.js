module.exports = (app, mod, build) => {
	return `
    <div class="saitoa build-overlay">

          
       <div class="settlers-items-container">
  
          <div class="settlers-item-row item-road ${
	mod.canPlayerBuildRoad(mod.game.player)
		? ``
		: `settlers-row-disabled`
}" id="0">
            <div class="settlers-item-column">
                <img class="settlers-item-img" src="/settlers/img/icons/road.png">
                <div>Road</div>
            </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource('brick', 1)}
              ${build.checkAndReturnResource('wood', 1)}
            </div>
          </div>
         
          <div class="settlers-item-row item-village ${
	mod.canPlayerBuildTown(mod.game.player)
		? ``
		: `settlers-row-disabled`
}" id="1" title="Settlements must be two segments away from any other settlement and city. You can only have up to 5 settlements on the board.">
            <div class="settlers-item-column">
                <img class="settlers-item-img" src="/settlers/img/icons/village.png">
                <div class="settlers-stats-vp-count">${mod.game.state.players[mod.game.player - 1].towns}</div>
                <div>Village</div>
            </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource('brick', 1)}
              ${build.checkAndReturnResource('wood', 1)}
              ${build.checkAndReturnResource('wheat', 1)}
              ${build.checkAndReturnResource('wool', 1)}
            </div>
          </div>
         
          <div class="settlers-item-row item-city ${
	mod.canPlayerBuildCity(mod.game.player)
		? ``
		: `settlers-row-disabled`
}" id="2" title="Cities are an upgrade of an existing settlement. You can only have 4 cities on the board.">
            <div class="settlers-item-column">
                <img class="settlers-item-img settlers-item-img-disabled" src="/settlers/img/icons/city.png">
                <div class="settlers-stats-vp-count">${mod.game.state.players[mod.game.player - 1].cities}</div>
                <div>City</div>
            </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource('ore', 3)}
              ${build.checkAndReturnResource('wheat', 2)}
            </div>
          </div>
         
         
          <div class="settlers-item-row item-development-card ${
	mod.canPlayerBuyCard(mod.game.player)
		? ``
		: `settlers-row-disabled`
}" id="3" title="Action cards are most likely to be a soldier, which allows you to move the bandit. Other cards give you victory points or allow you to gain resources.">
            <div class="settlers-item-column">
                <img class="settlers-item-img" src="${mod.card.back}">
                <!--i class="fa-solid fa-person-running"></i-->
                <div class="settlers-stats-vp-count">${mod.game.deck[0].crypt.length}</div>
              <div>Card</div>
              </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource('ore', 1)}
              ${build.checkAndReturnResource('wheat', 1)}
              ${build.checkAndReturnResource('wool', 1)}
            </div>
          </div>
        
      </div>
    </div>
  `;
};
