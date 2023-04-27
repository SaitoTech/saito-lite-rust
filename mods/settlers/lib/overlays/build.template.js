module.exports = BuildOverlayTemplate = (app, mod, build) => {

  console.log("mods ////");
  console.log(mod.game);

  return `
    <div class="build-overlay saitoa" id="trade_overlay">

          
       <div class="items-container">
  
          <div class="item-row item-road ${mod.canPlayerBuildRoad(mod.game.player) ? `` : `disabled`}" id="0">
            <div class="item-column item-goods">
                <img class="item-img" src="/settlers/img/icons/road.png">
                <div>Road</div>
            </div>

            <div class="item-column cards-container">
              ${build.checkAndReturnResource("brick", 1)}
              ${build.checkAndReturnResource("wood", 1)}
            </div>
          </div>
         
          <div class="item-row item-village ${mod.canPlayerBuildTown(mod.game.player) ? `` : `disabled`}" id="1">
            <div class="item-column item-goods">
                <img class="item-img" src="/settlers/img/icons/village.png">
                <div>Village</div>
            </div>

            <div class="item-column cards-container">
              ${build.checkAndReturnResource("brick", 1)}
              ${build.checkAndReturnResource("wood", 1)}
              ${build.checkAndReturnResource("wheat", 1)}
              ${build.checkAndReturnResource("wool", 1)}
            </div>
          </div>
         
          <div class="item-row item-city ${mod.canPlayerBuildCity(mod.game.player) ? `` : `disabled`}" id="2">
            <div class="item-column item-goods">
                <img class="item-img item-img-disabled" src="/settlers/img/icons/city.png">
                <div>City</div>
            </div>

            <div class="item-column cards-container">
              ${build.checkAndReturnResource('ore', 3)}
              ${build.checkAndReturnResource("wheat", 2)}
            </div>
          </div>
         
         
          <div class="item-row item-development-card ${mod.canPlayerBuyCard(mod.game.player) ? `` : `disabled`}" id="3">
            <div class="item-column item-goods">
                <img class="item-img" src="/settlers/img/cards/knight.png">
              <div>Card</div>
              </div>

            <div class="item-column cards-container">
              ${build.checkAndReturnResource('ore', 1)}
              ${build.checkAndReturnResource("wheat", 1)}
              ${build.checkAndReturnResource("wool", 1)}
            </div>
          </div>
        
      </div>
    </div>
  `;

}
