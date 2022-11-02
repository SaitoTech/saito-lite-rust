
module.exports = (app, mod, options) => {

    let title = options.title;

    let day = options.date.getDate();
    if (day < 10) { day = "0" + day; }

    let month = options.date.getMonth()+1;
    if (month < 10) { month = "0" + month; }

    let html = `

    <div class="saito-scheduler">

    <div class="saito-scheduler-event">
  
      <div class="saito-scheduler-details">

        <div class="saito-scheduler-label">What</div>
        <div class="saito-scheduler-title">${title}</div>

        <div class="saito-scheduler-label">When</div>
        <input type="text" class="saito-scheduler-text-input" placeholder="22 July at 20:10"/>
        <div></div>
        <div class="saito-scheduler-time-outputs">
          <div class="saito-scheduler-datetime">
              <input type="datetime-local" value="${options.date.getFullYear()}-${month}-${options.date.getDate()}T12:00" id="schedule-datetime-input" name="schedule-datetime" class="scheduler-datetime-input">
              <div class="event-type-input-container"></div>
          </div>
          <div class="saito-scheduler-natural-time"></div>
        </div>
      </div>

      <div class="saito-scheduler-label">Who</div>
      <div class="saito-scheduler-grid">
    `;

    let invite_text = "add a friend";
    let invite_details = "and make this an invite";

  
    for (let i = 0; i < options.slots.length; i++) {

      invite_text = "add another";
      invite_details = "public or private slot";

      if (i === 0) {
        html += `
          <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
            <div class="saito-identicon-box">
              <img class="saito-identicon" src="${app.keys.returnIdenticon(app.wallet.returnPublicKey())}" />
            </div>
            <div class="saito-address">me</div>
            <div class="saito-userline">invite creator</div>
          </div>
        `;
      }
      if (options.slots[i] === "public") {
        html += `
          <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
            <div class="saito-identicon-container">
              <img class="saito-identicon" src="/saito/img/no-profile.png" />
            </div>
            <div class="saito-address">public / open</div>
            <div class="saito-userline">anyone can join...</div>
          </div>
        `;
      } else {

	let publickey = options.slots[i];

        html += `
          <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
            <div class="saito-identicon-box">
              <img class="saito-identicon" src="${app.keys.returnIdenticon(publickey)}" />
            </div>
            <div class="saito-address">${publickey}</div>
            <div class="saito-userline">private invitation</div>
          </div>
        `;
      }
    }

    html += `
      <div class="saito-scheduler-invite saito-user" id="saito-scheduler-invite">
        <div class="saito-identicon-box">
          <img class="saito-identicon" src="/saito/img/no-profile.png" />
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

