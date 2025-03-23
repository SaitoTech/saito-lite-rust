module.exports = (menu, tweet, is_tweet_mine=false) => {

  let shortName = menu.app.keychain.returnUsername(menu.tweeter);
  let my_options = "";

  if (is_tweet_mine) { 
    my_options = `
          <li id="delete_tweet" class="tweet-menu-list-item">
	    <i class="fas fa-trash"></i>
            <div>delete tweet</div>
          </li>
          <li id="edit_tweet" class="tweet-menu-list-item">
	    <i class="fas fa-edit"></i>
            <div>edit tweet</div>
          </li>
    `;
  } else {
    my_options = `
           <li id="hide_tweet" class="tweet-menu-list-item">
            <i class="fa-solid fa-eye-slash"></i>
            <div>hide this tweet</div>
          </li>
          <li id="block_contact" class="tweet-menu-list-item">
            <i class="fa-solid fa-ban"></i>
            <div>block ${shortName}</div>
          </li>
    `;
  }


return `
      <div class="tweet-menu" style="top=${50}px; left=${50}px;">
        <ul class="saito-menu-list">
	  ${my_options}
          <li id="report_tweet" class="tweet-menu-list-item">
            <i class="fa fa-flag"></i>
            <div>report tweet</div>
          </li>
          <li id="show_tweet_info" class="tweet-menu-list-item">
            <i class="fa fa-circle-info"></i>
            <div>show info</div>
          </li>
        </ul>
      </div>
  `;

};



