
module.exports = SaitoModuleIntroTemplate = (app, mod, image = "/twilight/img/arcade/arcade.jpg", title = "Twilight Struggle" , description = "Twilight Struggle is a card-driven strategy game for two players, with its theme taken from the Cold War. One player plays the United States (US), and the other plays the Soviet Union (USSR). ") => {

  return `

  <div class="saito-module-intro">

    <div class="saito-module-intro-image">
      <img class="game-image" src="${image}">
    </div>

    <div class="saito-module-intro-details">
      <div>${title}</div>
      <div>${description}</div>

      <div class="saito-multi-select_btn saito-select">
       <div class="saito-multi-select_btn_options saito-slct">
          <button type="button" class="saito-multi-btn" data-type="open">Create Open Game</button>
          <button type="button" class="saito-multi-btn" data-type="private">Create Private Game</button>
       </div>
      </div>
    </div>

  </div>
  `;

}

