module.exports = (menu, tweet) => {

  let shortName = menu.app.keychain.returnUsername(menu.tweeter);

return `
      <div class="tweet-menu" style="top=${50}px; left=${50}px;">
        <ul class="saito-menu-list">
          <li id="block_contact" class="tweet-menu-list-item">
            <i class="fa-solid fa-ban"></i>
            <div>block ${shortName}</div>
          </li>
           <li id="hide_tweet" class="tweet-menu-list-item">
            <i class="fa-solid fa-eye-slash"></i>
            <div>hide this tweet</div>
          </li>
          <li id="report_tweet" class="tweet-menu-list-item">
            <i class="fa fa-flag"></i>
            <div>report tweet</div>
          </li>


        </ul>

      </div>
  `;

};



