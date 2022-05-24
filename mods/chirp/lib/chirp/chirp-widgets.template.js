module.exports = ChirpWidgetsTemplate = () => {
  return `

      <div class="widgets__input">
        <span class="material-icons widgets__searchIcon"> search </span>
        <input type="text" placeholder="Search on Saito" />
      </div>

      <div class="widgets__widgetContainer">
        <div class="tiny-calendar" id="tiny-calendar"></div>
      </div>

      <div class="widgets__widgetContainer">
        <h2>Upcoming Events</h2>
        <div class="widget-trends">
          Twilight Struggle
          <span>League Game, Nov 13 15:30</span>
        </div>
        <div class="widget-trends">
          Poker Tournament
          <span>all-in round-robin, Nov 16 12:00</span>
        </div>
        <div class="widget-trends">
          Marketing Call
          <span>2 members, Nov 17 10:00</span>
        </div>
        <div class="widget-trends">
          Final Vesting
          <span>ZZZ crypto, Nov 21 08:00</span>
        </div>
      </div>
      <div class="widgets__widgetContainer">
        <h2>Team</h2>
        <div class="widget-trends user">
          <img
            src="https://pbs.twimg.com/profile_images/1498334372490985476/ppnmrugO_400x400.jpg"
          />
          <div class="text">
            David Lancashire
            <div class="saito-user">
              <span class="saito">🟥</span>
              <span>dlancashi</span>
            </div>
          </div>
          <button class="button-small">Follow</button>
        </div>
        <div class="widget-trends user">
          <img
            src="https://pbs.twimg.com/profile_images/1509864860338769923/MkZu3Nul_400x400.jpg"
          />
          <div class="text">
            NaaQ
            <div class="saito-user">
              <span class="saito">🟥</span>
              <span>stevennaaq</span>
            </div>
          </div>
          <button class="button-small">Follow</button>
        </div>
      </div>

  `;
}
