module.exports = () => {

   return `
      <div class="saito-menu redsquare-menu">

        <div id="new-tweet" class="saito-button-primary">New Post</div>

        <ul class="saito-menu-list saito-sidebar-element">
          <li class="redsquare-menu-home saito-mouseover">
            <i class="fa-solid fa-house"></i>
            <span>Home</span>

          </li>
          <li class="redsquare-menu-notifications saito-mouseover">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </li>
          <li class="redsquare-menu-profile saito-mouseover">
            <i class="fas fa-user"></i>
            <span>Profile</span>
          </li>
<!---
          <li class="redsquare-menu-contacts saito-mouseover">
            <i class="fas fa-user"></i>
            <span>Contacts</span>
          </li>
--->
        </ul>

      </div>
  `;
}

