module.exports = (app, mod, this_obj) => {
  let html = `
  <div class="ts-overlay">
  <h1>${mod.cardToText(this_obj.card, true)}</h1>
  <div class="waroverlay-body">
  <div class="cardlist-container">
    <div class="card card-hud">${mod.returnCardImage(this_obj.card)}</div>
  </div>
  <div class="warstats">
    <div class="winner">${this_obj.winner}</div>
    <div>Roll: ${this_obj.roll}</div>
    <div>Mod: -${(this_obj.modifications) ? this_obj.modifications : ""}</div>
    <div>Modified Roll: ${this_obj.roll - this_obj.modifications}</div>
  `;
  if (this_obj.player){
    html += `<div>Sponsor: ` + this_obj.player.toUpperCase() + "</div>";
  }  
  html += `</div></div>`;

  return html;
}
