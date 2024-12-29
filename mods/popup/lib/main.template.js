module.exports = (mod) => {

console.log("SHOW VOCAB? " + mod.show_vocab);

	let html = `

    <div id="saito-container" class="saito-container">
      <div class="saito-sidebar left">

	<div class="menu">
	  <div class="saito-menu">
            <ul class="saito-menu-list saito-sidebar-element">

              <li class="popup-home redsquare-menu-home redsquare-page-active">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
              </li>

              <li class="popup-lessons redsquare-menu-lessons redsquare-page-active">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>Lessons</span>
              </li>
	`;

	if (mod.show_vocab) {

/***
<!---
              <li class="popup-notifications redsquare-menu-notifications">
                <i class="fas fa-bell"></i>
                <span>Notifications</span>
                <div class="saito-notification-dot" style="display: none;">0</div>
              </li>
---->
***/

		html += `
              		<li class="popup-vocab redsquare-menu-profile">
                		<i class="fas fa-user"></i>
                		<span>Vocab</span>
              		</li>
		`;
	}

	html += `

            </ul>
          </div>
        </div>

      </div>


      <div class="saito-main">
      </div>


      <div class="saito-sidebar right">
      </div>



    </div>
  `;

  return html;
};
