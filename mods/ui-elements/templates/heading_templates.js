module.exports = (app) => {

	return `
	<header class="saito-header">
    <img class="logo" alt="Logo" src="./img/saito_logo.png" />

    <nav>
      <ul class="list">
        <li class="list-item"><a href="#" class="link">Arcade</a></li>
        <li class="list-item"><a href="#" class="link">Dev Center</a></li>
        <li class="list-item"><a href="#" class="link">Blog</a></li>
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

      <div id="menuToggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  </header>
    `;
}