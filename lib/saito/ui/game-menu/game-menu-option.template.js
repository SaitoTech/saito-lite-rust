module.exports  = (options, sub_options = []) => {
	let classname = options.class ? options.class : '';

	let html = `<li id="${options.id}" class="game-menu-option ${classname}"><div class="game-menu-option-label">${options.text}</div>`;
	if (sub_options.length > 0) {
		html += '<ul class="game-menu-sub-options">';
		for (let z = 0; z < sub_options.length; z++) {
			classname = sub_options[z].class ? sub_options[z].class : '';
			html += `<li id="${sub_options[z].id}" class="game-menu-sub-option ${classname}"><div class="game-menu-option-label">${sub_options[z].text}</div>`;
			if (sub_options[z].sub_menu) {
				html += '<ul class="game-menu-sub-sub-options">';
				for (let y = 0; y < sub_options[z].sub_menu.length; y++) {
					html += `<li id="${sub_options[z].sub_menu[y].id}" class="game-menu-sub-sub-option"><div class="game-menu-option-label">${sub_options[z].sub_menu[y].text}</div>`;
				}
				html += '</ul>';
			}
			html += `</li>`;
		}
		html += '</ul>';
	}
	html += '</li>';

	return html;
};
