module.exports = RobUserOverlayTemplate = (rules) => {

  return `
        <div class="saitoa settlers-info-overlay">
          <div class="settlers-items-container settlers-items-container-2">
            <div class="settlers-item-row">
              <div class="settlers-item-info-text"> Select resource to trade with bank: </div>
            </div>
            <div class="settlers-item-row settlers-cards-container settlers-trade-resources">
              <img src="/settlers/img/cards/brick.png">
              <img src="/settlers/img/cards/brick.png">
              <img src="/settlers/img/cards/brick.png">
              <img src="/settlers/img/cards/brick.png">
            </div>
            <div class="settlers-item-row settlers-cards-container settlers-trade-resources">
              <img src="/settlers/img/cards/wood.png">
              <img src="/settlers/img/cards/wood.png">
              <img src="/settlers/img/cards/wood.png">
              <img src="/settlers/img/cards/wood.png">
            </div>
          </div>
          <div class="settlers-items-container">
            <div class="settlers-item-row">
              <div class="settlers-item-info-text"> Select desired resource: </div>
            </div>
            <div class="settlers-item-row settlers-cards-container settlers-desired-resources">
              <img src="/settlers/img/cards/brick.png">
              <img src="/settlers/img/cards/wood.png">
              <img src="/settlers/img/cards/wheat.png">
              <img src="/settlers/img/cards/wool.png">
              <img src="/settlers/img/cards/ore.png">
            </div>
          </div>
        </div>
  `;

}