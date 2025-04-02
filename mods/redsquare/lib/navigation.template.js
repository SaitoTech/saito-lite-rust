module.exports = (app, mod) => {
	let html = `
      <div class="saito-menu redsquare-menu">

        <div id="new-tweet" class="saito-button-primary"><i class="redsquare-tweet-icon fa-solid fa-pen"></i><span>New Post</span></div>

        <ul class="saito-menu-list saito-sidebar-element">
          <li class="redsquare-menu-home">
            <i class="fa-solid fa-house"></i>
            <span>Home</span>

          </li>
          <li class="redsquare-menu-notifications">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </li>
          <li class="redsquare-menu-profile">
            <i class="fas fa-user"></i>
            <span>Profile</span>
          </li>`;

  if (app.modules.returnModulesRespondingTo('saito-moderation-core')?.length){
    html += `<li class="redsquare-menu-settings">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </li>`;
  }

  if (mod.debug){
    html += `
          <li class="redsquare-menu-help">
            <i class="fa-solid fa-question"></i>
            <span>Debug</span>
          </li>
`;
  }

  html += `
  <!---
          <li class="redsquare-menu-contacts">
            <i class="fas fa-user"></i>
            <span>Contacts</span>
          </li>
  --->
        </ul>

      </div>
  `;

  return html;
};
