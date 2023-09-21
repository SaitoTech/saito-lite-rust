module.exports = BuildOverlayTemplate = (app, mod, build) => {

  return `
    <div class="saitoa settlers-info-overlay build-overlay">

          
       <div class="settlers-items-container">
  
          <div class="settlers-item-row item-road ${mod.canPlayerBuildRoad(mod.game.player) ? `` : `settlers-row-disabled`}" id="0">
            <div class="settlers-item-column">
                <img class="settlers-item-img" src="/settlers/img/icons/road.png">
                <div>Road</div>
            </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource("brick", 1)}
              ${build.checkAndReturnResource("wood", 1)}
            </div>
          </div>
         
          <div class="settlers-item-row item-village ${mod.canPlayerBuildTown(mod.game.player) ? `` : `settlers-row-disabled`}" id="1">
            <div class="settlers-item-column">
                <img class="settlers-item-img" src="/settlers/img/icons/village.png">
                <div>Village</div>
            </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource("brick", 1)}
              ${build.checkAndReturnResource("wood", 1)}
              ${build.checkAndReturnResource("wheat", 1)}
              ${build.checkAndReturnResource("wool", 1)}
            </div>
          </div>
         
          <div class="settlers-item-row item-city ${mod.canPlayerBuildCity(mod.game.player) ? `` : `settlers-row-disabled`}" id="2">
            <div class="settlers-item-column">
                <img class="settlers-item-img settlers-item-img-disabled" src="/settlers/img/icons/city.png">
                <div>City</div>
            </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource('ore', 3)}
              ${build.checkAndReturnResource("wheat", 2)}
            </div>
          </div>
         
         
          <div class="settlers-item-row item-development-card ${mod.canPlayerBuyCard(mod.game.player) ? `` : `settlers-row-disabled`}" id="3">
            <div class="settlers-item-column">
                <img class="settlers-item-img" src="/settlers/img/cards/knight.png">
              <div>Card</div>
              </div>

            <div class="settlers-cards-container">
              ${build.checkAndReturnResource('ore', 1)}
              ${build.checkAndReturnResource("wheat", 1)}
              ${build.checkAndReturnResource("wool", 1)}
            </div>
          </div>
        
      </div>
    </div>
  `;

}
