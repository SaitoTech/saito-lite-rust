
module.exports = (app, mod, options) => {

   return `
    <div class="scheduler-overlay-container">

      <div class="step"  id="first-step">
        <div class="overlay-content-container first-step">
          <div class="overlay-content-item scheduled-item" style="width:100%">

            <h5 style="float:left">Schedule:</h5>

            <div style="float:right" class="event-type-container">
              <div class="event-type-input-container schedule-type-container">
                <select class="saito-new-select" id="schedule-type">
                  <option value="game">Event</option>
                  <option value="game">Game</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div class="schedule-input-container">
          <textarea name="schedule-desc" placeholder="optional description?" id="schedule-desc"></textarea>
        </div>

        <div class="schedule-input-container">
          <div class="input-title">When?</div>
          <div class="event-type-container datetime">
            <div class="event-type-input-container">
              <input type="datetime-local" id="schedule-datetime-input" name="schedule-datetime" class="scheduler-datetime-input">
            </div>
            <div class="event-type-input-container">
            </div>
          </div>
        </div>

        <div class="schedule-input-container">
          <div class="input-title">Add Friends?</div>
        	  <div class="saito-user">
        	    <div class="saito-identicon-container">
        	      <img class="saito-identicon" src="/saito/img/no-profile.png" />
        	    </div>
        	    <div class="saito-username">add a friend</div>
        	    <div class="saito-userline">and make this an invite</div>
        	  </div>
        </div>

        <div class="scheduler-controls-container">
          <div id="scheduler-overlay-next-btn" class="saito-button-primary small scheduler-overlay-control-btn">
            Next
          </div>
        </div>
      </div>

    </div>
   `;

}

