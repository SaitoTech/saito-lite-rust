module.exports = () => {

   return `
      <div class="saito-menu redsquare-menu">

        <div id="new-tweet" class="saito-button-primary">New Post</div>

        <ul class="saito-menu-list">
          <li class="redsquare-menu-home">
            <i class="fa-solid fa-house"></i>
            <span class="no-display-hover">Home</span>
            <span class="display-on-hover">Refresh</span>
          </li>
          <li class="redsquare-menu-notifications">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </li>
          <li class="redsquare-menu-profile">
            <i class="fas fa-user"></i>
            <span>Profile</span>
          </li>
<!---
          <li class="redsquare-menu-contacts">
            <i class="fas fa-user"></i>
            <span>Contacts</span>
          </li>
--->
        </ul>

      </div>
  `;
}

