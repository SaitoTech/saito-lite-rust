
module.exports = (app, mod) => {

  return `

    <h6>Your Groups</h6>
    <div id="saito-grouplist" class="saito-grouplist" style="margin-bottom:2rem">

      <div class="saito-userbox">
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

      <div class="saito-userbox">
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

