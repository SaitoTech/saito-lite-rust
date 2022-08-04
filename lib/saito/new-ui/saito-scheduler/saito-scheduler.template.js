
module.exports = (app, mod, options) => {

    let html = `

    <div class="saito-scheduler">

      <h5 style="float:left">Schedule:</h5>

      <div class="saito-scheduler-event">
        <select class="saito-new-select" id="schedule-type">
          <option value="game">Event</option>
          <option value="game">Game</option>
        </select>
      </div>

      <div class="saito-scheduler-label">When?</div>
      <div class="saito-scheduler-datetime">
        <input type="datetime-local" id="schedule-datetime-input" name="schedule-datetime" class="scheduler-datetime-input">
        <div class="event-type-input-container"></div>
      </div>

      <div class="saito-scheduler-label">Invite Friends?</div>
      <div class="saito-scheduler-grid">
    `;

   
    for (let i = 0; i < options.slots.length; i++) {
      if (options.slots[i] === "public") {
        html += `
          <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
            <div class="saito-identicon-container">
              <img class="saito-identicon" src="/saito/img/no-profile.png" />
            </div>
            <div class="saito-username">public / open</div>
            <div class="saito-userline">anyone can join...</div>
          </div>
        `;
      } else {

	let publickey = options.slots[i];

        html += `
          <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
            <div class="saito-identicon-container">
              <img class="saito-identicon" src="${app.keys.returnIdenticon(publickey)}" />
            </div>
            <div class="saito-username">${publickey}</div>
            <div class="saito-userline">private invitation</div>
          </div>
        `;
      }
    }


    html += `
      <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
        <div class="saito-identicon-container">
          <img class="saito-identicon" src="/saito/img/no-profile.png" />
        </div>
        <div class="saito-username">add a friend</div>
        <div class="saito-userline">and make this an invite</div>
      </div>
    `;


    html += `

      </div>

      <div id="saito-scheduler-button" class="saito-button-primary small saito-scheduler-button">
        Next
      </div>

    </div>
    `;

    return html;

}

