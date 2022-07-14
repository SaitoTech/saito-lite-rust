
module.exports = (app, mod) => {

  return `

    <h6>Your Groups</h6>
    <div id="saito-grouplist" class="saito-grouplist" style="margin-bottom:2rem">

<div class="saito-list-user">
    <div class="saito-list-user-image-box">
        <img class="saito-idenitcon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsMTMyLDM4LDEpOyBzdHJva2U6cmdiYSgyMTcsMTMyLDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzAnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzMzNicgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PC9nPjwvc3ZnPg==">
    </div>
    <div class="saito-list-user-content-box">
    <div class="saito-username">
        <p>mxCBwzo3TKSCQ63RSD2hyzFaAv8LUok2LcPaw8sNYa5d</p>
        <i class="fas fa-certificate redsquare-certificate"></i>
   </div>
        <p class="saito-tweet-timestamp">3:46 PM - July 7, 2022 </p>
    </div>
    
    <div class="x">
    <i class="fas fa-solid fa-ellipsis-h"></i>
</div>
</div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon" src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
	<div class="saito-list-user-content-box">
          <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
          <div class="saito-username">
	    {app.keys.returnUsername(app.keys.keys[0].publickey)}
	  </div>
	</div>
      </div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

    </div>

    <h6>Your Contacts</h6>
    <div id="saito-friendlist" class="saito-friendlist">

      <div class="saito-userbox odd">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox odd">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox odd">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox odd">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox odd">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

      <div class="saito-userbox">
        <div class="saito-identicon"><img class="saito-identicon"src="${app.keys.returnIdenticon(app.keys.keys[0].publickey)}" /></div>
        <div class="saito-publickey">${app.keys.keys[0].publickey}</div>
        <div class="saito-username">${app.keys.returnUsername(app.keys.keys[0].publickey)}</div>
        <div class="">unencrypted</div>
      </div>

    </div>

  `;

}

