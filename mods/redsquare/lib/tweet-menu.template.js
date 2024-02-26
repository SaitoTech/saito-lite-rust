module.exports = (menu, tweet) => {

  let shortName = menu.app.keychain.returnUsername(menu.tweeter);
  let add_contact = 
    `
      <li id="follow_contact" class="tweet-menu-list-item">
        <i class="fa-solid fa-user-plus"></i>
        <div>follow ${shortName}</div>
      </li>
    `;

  if (menu.mod.isFollowing(menu.tweeter)){
    add_contact = 
    `
      <li id="unfollow_contact" class="tweet-menu-list-item">
        <i class="fa-solid fa-user-minus"></i>
        <div>unfollow ${shortName}</div>
      </li>
    `;
  }


	return `
      <div class="tweet-menu" style="top=${50}px; left=${50}px;">
        <ul class="saito-menu-list">
          ${add_contact}
          <li id="mute_contact" class="tweet-menu-list-item">
            <i class="fa-solid fa-volume-xmark"></i>
            <div>mute ${shortName}</div>
          </li>
          <li id="block_contact" class="tweet-menu-list-item">
            <i class="fa-solid fa-ban"></i>
            <div>block ${shortName}</div>
          </li>

          <li id="hide_tweet" class="tweet-menu-list-item">
            <i class="fa-solid fa-eye-slash"></i>
            <div>hide this Tweet</div>
          </li>
          <li id="report_tweet" class="tweet-menu-list-item">
            <i class="fa fa-flag"></i>
            <div>report this tweet</div>
          </li>


        </ul>

      </div>
  `;

};



