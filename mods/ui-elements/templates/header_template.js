module.exports = (app) => {
    return ` <header class="saito-header">
    <img class="logo" alt="Logo" src="./img/saito_logo.png" />

    <nav>
      <ul class="list d-none d-lg-flex">

        <li class="list-item big-menu-container">
          <div class="link" id="big-menu-toggle" href="#">Shortcodes</div>
          <div class="big-menu">
            <a href="#" class="big-menu-link" href="">Buttons</a>
            <a href="#" class="big-menu-link" href="">Grids</a>
            <a href="#" class="big-menu-link" href="">Forms</a>
            <a href="#" class="big-menu-link" href="">Selects</a>
            <a href="#" class="big-menu-link" href="">Cards</a>
          </div>
        </li>
      </ul>
      <div style="margin-right: 3rem">
        <label class="switch">
          <input class="check-input" type="checkbox" />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="relative" style="">
        <div id="menuToggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div id="hamburger-contents">
          <div class="saito-profile">
            <img src="./img/account.svg" />
            <div class="saito-profile-info">
              <p>wqhjM8kvwww...</p>
              <div>0.0000 SAITO</div>
            </div>
          </div>

          <div class="saito-menu-section">
            <div class="saito-menu-item">
              <i class="fa-solid fa-plus"></i>
              <p>Create Game</p>
            </div>
          </div>
          <div class="saito-menu-section">
            <div class="saito-menu-item">
              <i class="fa-solid fa-arrow-rotate-left"></i>
              <p>Reset/Nuke Wallet</p>
            </div>
            <div class="saito-menu-item">
              <i class="fa-solid fa-gear"></i>
              <p>Settings</p>
              
            </div>
            <div class="saito-menu-item">
              <i class="fa-solid fa-magnifying-glass"></i>
              <p>Scan</p>
            </div>
          </div>
          <div class="saito-menu-section">
          
            <div class="saito-menu-item">
              <i class="fa-solid fa-chess-board"></i>
              <p>Arcade</p>
            </div>
            <div class="saito-menu-item">
              <i class="fa-solid fa-rss"></i>
              <p>Blog</p>
            </div>
            <div class="saito-menu-item">
              <i class="fa-solid fa-rocket"></i>
              <p>Dev center</p>
            </div>
          </div>
            
          </div>
        </div>
      </div>
    </nav>
  </header>`

}




{/* <li class="menu-item">
<a class="menu-link" data-url="?display=carousels"><div><i class="icon-heart3"></i>Carousel</div></a>
</li> */}

