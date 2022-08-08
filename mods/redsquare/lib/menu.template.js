
module.exports = RedSquareMenuTemplate = (app, mod) => {

  return `
    <div class="redsquare-menu">
          <div>
            <div class="saito-menu">
              <ul class="saito-menu-list">
                <li class="redsquare-menu-home">
                  <i class="fas fa-home"></i>
                  <span> Home </span>
                </li>
                <li class="redsquare-menu-games">
                  <i class="fas fa-gamepad"></i>
                  <span> Games</span>
                </li>
                <li class="redsquare-menu-notifications">
                  <i class="fas fa-bell"></i>
                  <span> Notifications</span>
                </li>
                <li class="redsquare-menu-contacts">
                  <i class="far fa-id-card"></i>
                  <span> Contacts</span>
                </li>
              </ul>
            </div>
          </div>
    </div>
  `;

}

