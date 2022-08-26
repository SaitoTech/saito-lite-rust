module.exports = (app, mod, identiconUri, publickey) => {

  return `

    <div id='tweet-overlay-add-frnd'>
      <div class="saito-identicon-box">
        <img class="saito-identicon" src="${identiconUri}">
      </div>
    
      <div class="saito-address">${publickey}</div>
      <div class="saito-button-primary" id="" data-id="${publickey}">Add Friend</div>
    </div>     

  `;

}

