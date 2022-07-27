module.exports = (app, mod, options) => {

  console.log('event options');
  console.log(options);

  let content = "";
  if (options.type === "game") {
    for(let i=0; i<options.games.length; i++) {
      content += `
        <div class="scheduled-game-box-container">
          <div class="scheduled-game-box-item">
            <input type="radio" id="${options.games[i].title}" name="game" value="${options.games[i].title}">
          </div>
          <div class="scheduled-game-box-item img">  
            <img class="schedule-game-img" src="${options.games[i].image}">
          </div>
          <div class="scheduled-game-box-item">
            <h6>${options.games[i].title}</h6>
            <p class="schedule-game-desc">${options.games[i].description}</p>
          </div>
        </div>
      `;
    }
  }


   return `
    <div class="scheduler-overlay-container">
      

      <div class="step"  id="first-step">

        <div class="overlay-content-container first-step">
          <div class="overlay-content">
            <div>Invite:</div> 
            <select id="schedule-person">
              <option value="1">1 person</option>
              <option value="2">2 person</option>
              <option value="3">3 person</option>
              <option value="4">4 person</option>
              <option value="5">5 person</option>
              <option value="6">6 person</option>
            </select>

            <div>To:</div>
            <select id="schedule-type">
              <option value="game">Game</option>
              <option value="league">League</option>
              <option value="video-call">Video Call</option>
            </select>            
          

            Select datetime:
            <input type="datetime-local" id="schedule-datetime" name="schedule-datetime">
          </div>

          <div class="overlay-content-item scheduled-timestamp">
            <p>Set timezone</p>
            <select id="schedule-timezone">
              <option value="game">Game</option>
              <option value="league">League</option>
              <option value="video-call">Video Call</option>
            </select>  
          </div>
        </div>

        <div id="scheduler-overlay-next-btn" class="saito-button-secondary small scheduler-overlay-step-btn">
          Next <i class="fa fa-regular fa-arrow-right"></i>
        </div>
      </div>

      <div class="step hide" id="second-step">
        <div class="overlay-content">
          <p class="schedule-msg"></p>
          <a href="#">Send Game Invite To Friends</a>
        </div>
        <div id="scheduler-overlay-back-btn" class="saito-button-secondary small scheduler-overlay-step-btn">
          <i class="fa fa-regular fa-arrow-left"></i> Back
        </div>
        <div id="scheduler-overlay-finish-btn" class="saito-button-primary small scheduler-overlay-step-btn">
          Save Event
        </div>
      </div>
    </div>
   `;

}

