
module.exports = RedSquareSidebarTemplate = (app, mod) => {

  return `
<div class="saito-sidebar right">

<div class="top-container" style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 1rem;
">
<div class="top-container-cal">
<h6 style="
    font-size: 2rem;
    padding-bottom: 0.5rem;
">Your Calendar</h6>

<div class="saito-calendar small">
        <div class="saito-calendar-month">
          <i class="fas fa-angle-left saito-calendar-prev"></i>
          <div class="saito-calendar-date">
            <div>
              <h4>July</h4>
              <p>2022</p>
            </div>
          </div>
          <i class="fas fa-angle-right saito-calendar-next"></i>
        </div>
        <div class="saito-calendar-days"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div class="today">10</div><div>11</div><div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div><div>27</div><div>28</div><div>29</div><div>30</div><div>31</div><div class="next-date">1</div><div class="next-date">2</div><div class="next-date">3</div><div class="next-date">4</div><div class="next-date">5</div><div class="next-date">6</div></div>
    </div>

</div>
<div class="top-container-text">
<h6 style="
    font-size: 2rem;
    padding-bottom: 0.5rem;
">About</h6>

Red Square is a social media and gaming portal running on the Saito blockchain.

<p></p>

Schedule games, meetings, zoom calls and more.

<p></p>

And click on your calendar anytime to manage one-off and recurring events.

</div>
</div>

    <div class="saito-leaderboard">
<h6 style="
    font-size: 2rem;
    padding-bottom: 0.5rem;
">Your Rankings:</h6>
<div class="saito-leaderboard-row odd">
  <div class="saito-leaderboard-gamename">Twilight Struggle</div>
  <div class="saito-leaderboard-rank">4</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row">
  <div class="saito-leaderboard-gamename">Red Imperium</div>
  <div class="saito-leaderboard-rank">97</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row odd">
  <div class="saito-leaderboard-gamename">Spider Solitaire</div>
  <div class="saito-leaderboard-rank">1435</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row">
  <div class="saito-leaderboard-gamename">Settlers of Saitoa</div>
  <div class="saito-leaderboard-rank">352</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row odd">
  <div class="saito-leaderboard-gamename">Pandemic</div>
  <div class="saito-leaderboard-rank">4242</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row">
  <div class="saito-leaderboard-gamename">Blackjack</div>
  <div class="saito-leaderboard-rank">2222</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row odd">
  <div class="saito-leaderboard-gamename">Chess</div>
  <div class="saito-leaderboard-rank">1283</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row">
  <div class="saito-leaderboard-gamename">Poker</div>
  <div class="saito-leaderboard-rank">924</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row odd">
  <div class="saito-leaderboard-gamename">Solitrio Solitaire</div>
  <div class="saito-leaderboard-rank">63</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row">
  <div class="saito-leaderboard-gamename">Wordblocks</div>
  <div class="saito-leaderboard-rank">1452</div>
  <div class="saito-leaderboard-change">+7</div>
</div>
<div class="saito-leaderboard-row odd">
  <div class="saito-leaderboard-gamename">Wuziqi</div>
  <div class="saito-leaderboard-rank">843</div>
  <div class="saito-leaderboard-change">+7</div>
</div>


  <div id="redsquare-follow-container">
      <h5> Who to follow </h5>
      <div>
          <div class="saito-list">
              <div class="saito-list-user">
                  <div class="saito-list-user-image-box">
                      <img class="saito-idenitcon" src="/redsquare/images/david.jpeg" />
                  </div>
                  <div class="saito-list-user-content-box">
                      <div class="saito-username">David Lancashire
                      </div>
                      <p> @trevelyan </p>
                  </div>
              </div>
              <div class="saito-list-user">
                  <div class="saito-list-user-image-box">
                      <img class="saito-idenitcon" src="/redsquare/images/richard.jpeg" />
                  </div>
                  <div class="saito-list-user-content-box">
                      <div class="saito-username">Richard Parris</div>
                      <p> @arpee</p>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>


  `;


}

