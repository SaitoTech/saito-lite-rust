
module.exports = (app, mod) => {

  return `

      <div id="redsquare-appspace-home" class="redsquare-appspace-home">

        <div class="saito-page-header" id="redsquare-home-header">
         <div class="redsquare-new-tweets-banner" id="redsquare-new-tweets-banner">Load New Posts</div> 
         
         <div class="saito-redsquare-actions-buttons">
           <div class="saito-redsquare-actions-buttons-icon">
           <i id="action-icon" class="fas fa-plus"></i>
           </div>
          <div class="redsquare-actions-container"> 
            <div id="redsquare-new-tweet" class="saito-button-secondary small">New Post</div>
            <div id="redsquare-my-profile" class="saito-button-secondary small">My Profile</div>
          </div>
          <div id="saito-page-header-title" class="saito-page-header-title">🟥 RED SQUARE</div>
          </div>
        </div>

        <div class="redsquare-list-open" id="redsquare-list-open"> </div>
        <div class="redsquare-list" id="redsquare-list">
	  <div class="saito-loader"></div> 
	  </p></p>
	  loading...
	</div>
      <div id="redsquare-intersection">
      </div>
      </div>
    `;

}


{/*
  <div id="redsquare-fetch-new" class="saito-button-secondary small">🟥 Fetch Tweets</div>
  
*/ }
