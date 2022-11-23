module.exports = (app, mod) => {

   return `
      <div class="saito-menu">
        <ul>
          <li class="redsquare-menu-home">
            <i class="fa-solid fa-house"></i>
            <span>Home</span>
          </li>
          <li class="redsquare-menu-games">
            <i class="fas fa-gamepad"></i>
            <span>Games</span>
          </li>
          <li class="redsquare-menu-notifications">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </li>
          <li class="redsquare-menu-contacts">
            <i class="far fa-id-card"></i>
            <span>Contacts</span>
          </li>
        </ul>
      </div>
  `;
}

