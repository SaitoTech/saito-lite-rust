const RedSquareLeagueSidebar = require('./league-sidebar.template');

module.exports = RedSquareSidebarTemplate = (app, mod) => {

  return `

  <div class="saito-sidebar right">

  <div class="redsquare-sidebar-calendar">
  </div>

  ${RedSquareLeagueSidebar(app, mod)}
</div>


  `;


}

