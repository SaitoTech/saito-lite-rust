module.exports = (app) => {

    return `   <!-- feed starts -->
    <div class="row">
    <div  class="col-sm-12 col-lg-9" id="feed">
    </div>
    <!-- feed ends -->

    <!-- widgets starts -->
    <div class="widgets d-none d-lg-block col-lg-3">
      <div class="widgets__input">
        <span class="material-icons widgets__searchIcon"> search </span>
        <input type="text" placeholder="Search on Saito" />
      </div>

      <div class="widgets__widgetContainer">
        <h2>Trends for you</h2>
        <div class="widget-trends">
          Elon Musk
          <span>34051 Saitons </span>
        </div>
        <div class="widget-trends">
          Web3
          <span>4892 Saitons </span>
        </div>
        <div class="widget-trends">
          Saito x Binance
          <span>420 Saitons </span>
        </div>
      </div>
      <div class="widgets__widgetContainer team">
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
          <button  class=" button-small ">Follow</button>
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
    </div>
    <div/>
`;
}