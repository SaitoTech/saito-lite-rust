module.exports  = (app, mod, theme_options, selected_theme) => {
	console.log(theme_options, selected_theme);

	let options = ``;
	for (var theme in theme_options) {
		options += `
          <div id="user_menu_item_${theme}" data-theme="${theme}" class="saito-modal-menu-option">
            <i class="${theme_options[theme]}"></i>
            <div>${theme.toUpperCase()} ${
			theme == selected_theme ? `<i class="fa-solid fa-check"></i>` : ``
		}</div>
          </div>`;
	}

	let html = `
    <div class="saito-modal saito-modal-menu" id="saito-them-menu">
      <div class="saito-modal-content">
          ${options}
      </div>
   </div>
  `;

	return html;
};
