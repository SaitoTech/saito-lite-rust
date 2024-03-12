module.exports = (app, mod) => {
	

  let html = `<div id="limbo-menu" class="saito-menu redsquare-menu">`;

  if (mod.publicKey !== mod.dreamer){
    html += `<div id="new-space" class="saito-button-primary">New Space</div>`
  }else{
    html += `<div id="exit-space" class="saito-button-primary">End Space</div>`
  }

  html +=`<div class="sidebar-header">
            <div class="sidebar-title">Spaces</div>
        </div>

        <div id="spaces" class="spaces-list saito-sidebar-element"></div>

      </div>
  `;

  return html;
};
