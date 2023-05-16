module.exports = MonopolyOverlayTemplate = (app, mod, monopoly) => {

  let resourceList = mod.skin.resourceArray();

  let html = `
      <div class="saitoa settlers-info-overlay monopoly">      

        <div class="settlers-items-container">

          <div class="settlers-item-row">
            <div class="settlers-item-info-text"> Select 1 type of resource, <br > all other players must give all of this resource if they have it: </div>
          </div>

          <div class="settlers-item-row settlers-cards-container settlers-desired-resources">
  `;

  

          for (let i of resourceList) {
            console.log("/////////////// " +i);
            html += `<img id="${i}" src="${mod.skin.resourceCard(i)}" >`;
          }

  html += `

          </div>

        </div>
      </div>

  `;

  return html;

}