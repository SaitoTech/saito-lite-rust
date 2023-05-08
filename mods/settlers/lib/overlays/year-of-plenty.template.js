module.exports = YearOfPlentyOverlayTemplate = (app, mod, year_of_plenty) => {

  let resourceList = mod.skin.resourceArray();

  let html = `
      <div class="saitoa settlers-info-overlay year-of-plenty-overlay">
        <div class="settlers-items-container">
          <div class="settlers-item-row">
            <div class="settlers-item-info-text"> Select any 2 resources from bank (can be same or different): </div>
          </div>
          <div class="settlers-item-row settlers-cards-container settlers-desired-resources settlers-select-options">
  `;

          for (let i of resourceList) {
            html += `<img id="${i}" src="${mod.skin.resourceCard(i)}" >`;
          }


  html += `
          </div>


          <div class="settlers-item-row">
            <div class="settlers-item-info-text"> Selected resources: </div>
          </div>
          <div class="settlers-item-row settlers-cards-container settlers-desired-resources settlers-selected-resources">
        
          </div>
        </div>
      </div>
  `;


  return html;




            //         <img src="https://test.saito.io/settlers/img/cards/brick.png">
            // <img src="https://test.saito.io/settlers/img/cards/wood.png">
            // <img src="https://test.saito.io/settlers/img/cards/wheat.png">
            // <img src="https://test.saito.io/settlers/img/cards/wool.png">
            // <img src="https://test.saito.io/settlers/img/cards/ore.png">

          // <div class="settlers-item-row">
          //   <div class="settlers-item-info-text"> Selected resources: </div>
          // </div>
          // <div class="settlers-item-row settlers-cards-container settlers-desired-resources">
          //   <div class="card-item">
          //     <!-- this div needed for ::after, ::after doesnt work on img -->
          //     <img src="https://test.saito.io/settlers/img/cards/brick.png">
          //   </div>
          //   <div class="settlers-card-item">
          //     <!-- this div needed for ::after, ::after doesnt work on img -->
          //     <img src="https://test.saito.io/settlers/img/cards/wool.png">
          //   </div>
          // </div>

}