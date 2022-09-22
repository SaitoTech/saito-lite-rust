
module.exports = SaitoModuleIntroTemplate = (app, mod, image = "/twilight/img/arcade/arcade.jpg", title = "Twilight Struggle" , description = "Twilight Struggle is a card-driven strategy game for two players, with its theme taken from the Cold War. One player plays the United States (US), and the other plays the Soviet Union (USSR). ") => {

  return `

  <div class="saito-module-intro">

    <div class="saito-module-intro-image">
      <img class="game-image" src="${image}">
    </div>

    <div class="saito-module-intro-details">
      <div>${title}</div>
      <div>${description}</div>
    </div>

  </div>
  `;

}

