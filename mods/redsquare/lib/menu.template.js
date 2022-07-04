
module.exports = RedSquareMenuTemplate = (app, mod) => {

  return `
    <div class="redsquare-menu">
          <div>
            <div class="saito-menu  ">
              <ul>
                <li>
                  <i class="fas fa-home"></i>
                  <span> Home </span>
                </li>
                <li class="redsquare-menu-arcade">
                  <i class="fas fa-gamepad"></i>
                  <span> Games</span>
                </li>
                <li>
                  <i class="fas fa-calendar"></i>
                  <span> Events</span>
                </li>
                <li class="redsquare-menu-invites">
                  <i class="far fa-id-card"></i>
                  <span> Invites</span>
                </li>
                <li class="redsquare-menu-settings">
                  <i class="fas fa-settings"></i>
                  <span> Settings</span>
                </li>
              </ul>
            </div>
          </div>
    </div>
  `;

}

