
module.exports = SaitoSidebarTemplate = (app, mod) => {

  let html = `

  <div class="saito-sidebar left">

  <div class="hamburger">
   <i id='icon' class="fas fa-bars"></i>
  </div>

  <div class="section">
    <div>
      <h5> Menu </h5>
    </div>
    <div>
      <div class="saito-menu-list dense ">
        <ul>
          <li>
            <i class="fas fa-home"></i>
            <span> Home </span>
          </li>
          <li>
            <i class="fas fa-calendar"></i>
            <span> Events</span>
          </li>
          <li>
            <i class="far fa-id-card"></i>
            <span> Invites</span>
          </li>
          <li>
            <i class="fas fa-user"></i>
            <span> Profile</span>
          </li>
          <li>
            <i class="fas fa-gamepad"></i>
            <span> Games</span>
          </li>
          <li>
            <i class="fas fa-address-book"></i>
            <span>Contacts</span>
          </li>
        </ul>
      </div>
    </div>
  </div>


  <div class="section">
    <div>
      <h5> Chat </h5>
      <i class="fas fa-ellipsis-v"></i>
    </div>
    <div class="">
      <div class="saito-item-list dense saito-white-background  ">
        <div>
          <img src="/saito/img/background.png" />
          <div class="item-info">
            <p>Saito Community Chat </p>
            <span> new chat</span>
          </div>

        </div>
        <div class="saito-user ">
          <img src="/saito/img/background.png" />
          <div class="item-info">
            <p>Saito Community Chat</p>
            <span>new chat</span>
          </div>


        </div>

      </div>
    </div>
  </div>




</div>

<div class="saito-sidebar right">
<div class="saito-search-bar">
  <i class="fas fa-search"></i> <input type="text" placeholder="Search on Saito" />
</div>
<div class="saito-calendar-small"></div>

</div>

  `;

  return html;
}

