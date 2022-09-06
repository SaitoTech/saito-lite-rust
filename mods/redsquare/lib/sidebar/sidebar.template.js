const RedSquareLeagueSidebarTemplate = require('./league-sidebar.template');
const RedSquareObserverSidebarTemplate = require('./observer-sidebar.template');

module.exports = RedSquareSidebarTemplate = (app, mod) => {

  return `

  <div class="saito-sidebar right">
  <div class="caret">
  <i id="icon" class="fas fa-angle-left"></i>
  </div>
    <div class="redsquare-sidebar-calendar">
    </div>
    ${RedSquareObserverSidebarTemplate(app, mod)}
    ${RedSquareLeagueSidebarTemplate(app, mod)}

  </div>

  `;


}

