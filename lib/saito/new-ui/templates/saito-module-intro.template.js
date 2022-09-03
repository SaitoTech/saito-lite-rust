
module.exports = SaitoModuleIntroTemplate = (app, mod, image = "/twilight/img/arcade/arcade.jpg", title = "Twilight Struggle" , description = "Twilight Struggle is a card-driven strategy game for two players, with its theme taken from the Cold War. One player plays the United States (US), and the other plays the Soviet Union (USSR). ") => {

  return `

  <div class="saito-module-intro">

    <div class="saito-module-intro-image">
      <img class="game-image" src="${image}">
    </div>

    <div class="saito-module-intro-details">
      <div>${title}</div>
      <div>${description}</div>

      <div class="dynamic_button saito-select">
       <div class="dynamic_button_options saito-slct">
          <button type="button" id="game-invite-btn" class="game-invite-btn" data-type="open">Create Open Game</button>
          <button type="button" id="game-invite-btn" class="game-invite-btn tip" data-type="private">Create Private Game<div class="tiptext">Other players on the Saito network will not see this game and can only join if you provide them the invitation link</div></button>
       </div>
      </div>
    </div>

  </div>
  `;

}

