module.exports = MonopolyOverlayTemplate = (app, mod, monopoly) => {
  let resourceList = mod.returnResources();

  let html = `
      <div class="saitoa settlers-info-overlay bank-overlay">      

        <div class="settlers-items-container">

          <div class="settlers-item-info-text"> Select a resource to collect from the other players: </div>

          <div class="settlers-item-row settlers-cards-container settlers-desired-resources">
  `;

  for (let i of resourceList) {
    html += `<img id="${i}" src="${mod.returnCardImage(i)}" >`;
  }

  html += `</div>
        </div>
      </div>`;

  return html;
};
