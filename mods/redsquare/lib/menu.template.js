
module.exports = RedSquareMenuTemplate = (app, mod) => {

  return `
    <div id="redsquare-red-button" class="redsquare-red-button saito-button-primary">
      Tweet
    </div>

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
                <li class="redsquare-menu-invites">
                  <i class="far fa-id-card"></i>
                  <span> Notifications</span>
                </li>
                <li class="redsquare-menu-settings">
                  <i class="fas fa-calendar"></i>
                  <span> Settings</span>
                </li>
                <li class="redsquare-menu-invites">
                  <i class="far fa-id-card"></i>
                  <span> Friends</span>
                </li>
              </ul>
            </div>
          </div>
    </div>
  `;

}

