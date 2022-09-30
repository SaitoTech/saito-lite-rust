const SaitoArcadeBoxTemplate = require("./../../../../lib/saito/new-ui/templates/saito-arcade-box.template");

module.exports = RedSquareSidebarTemplate = (app, mod) => {

  return `

  <div class="saito-sidebar right">
    
    <div class="redsquare-sidebar-calendar">
    </div>
    
    <div class="redsquare-sidebar-arcade">
    </div>

    <div class="redsquare-sidebar-observer">
    </div>

    <div class="redsquare-sidebar-box">
        ${SaitoArcadeBoxTemplate()}
    </div>

    <div class="redsquare-sidebar-league">
    </div>
  
  </div>

  `;


}

