module.exports  = (app, mod, league) => {
	let game_mod = app.modules.returnModuleByName(league.game);
	let img = '',
		key_words = '',
		game_name = '';
	if (game_mod) {
		img = game_mod.respondTo('arcade-games').image;
		key_words = game_mod.categories
			.replace('Games ', '')
			.split(' ')
			.reverse()
			.join(' ');
		game_name = game_mod.returnName();
	}
	let key = app.keychain.returnKey(mod.publicKey);

	let isMember = league.rank >= 0;
	let newPlayer =
		league.admin && !key.email && league.admin !== mod.publicKey;

	let html = `
        <div class="league-overlay">
            <div class="league-overlay-header">
                <div class="league-overlay-header-image" style="background-image: url('${img}')"></div>
                <div class="league-overlay-header-title-box">
                    <div class="league-overlay-header-title-box-title ${
	league.name.length > 15 ? 'oversize-load' : ''
}">${league.name}</div>
                    <div class="league-overlay-header-title-box-desc">${
	league.admin ? `${game_name} league` : key_words
}</div>
                </div>
                <div class="league-overlay-controls">
                    <div id="home" class="menu-icon active-tab"><i class="fas fa-house"></i><div class="menu-text">Home</div></div>
                    <div id="games" class="menu-icon"><i class="fas fa-history"></i><div class="menu-text">Activity</div></div>
                    <div id="rankings" class="menu-icon mobile-only"><i class="fa-solid fa-list-ol"></i><div class="menu-text">Rankings</div></div>`;

	if (league.admin) {
		html +=
			league.admin === mod.publicKey
				? `<div id="players" class="menu-icon"><i class="fas fa-users-cog"></i><div class="menu-text">Manage</div></div>`
				: `<div id="contact" class="menu-icon"><i class="fas fa-comment-alt"></i><div class="menu-text">Contact</div></div>`;
	}

	html += `   </div>
            </div>
            <div class="league-overlay-body">
                <div class="league-overlay-body-content">
                    <div class="league-overlay-description league-overlay-content-box ${(newPlayer || league.unverified) && isMember ? 'hidden'	: ''}">`
    html +=  league.description;
    if (!league?.admin && game_mod.publisher_message) {
		html += `<div id="arcade-game-publisher-message" class="arcade-game-publisher-message">
      				<span>NOTE: </span>
      				${game_mod.publisher_message}
      			</div>`;
	}

    html +=         `</div>
                    <div class="league-overlay-league-body-games league-overlay-content-box hidden">
                        <div class="league-overlay-games-list league_recent_games"></div>
                    </div>`;

	if (league.admin) {
		if (league.admin == mod.publicKey) {
			html += `<div id="admin-widget" class="admin-widget league-overlay-content-box hidden"></div>`;
		} else {
			html += `<div id="admin_details" class="saito-user league-overlay-content-box hidden" id="saito-user-${
				league.admin
			}" data-id="${league.admin}">
                        <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keychain.returnIdenticon(
		league.admin
	)}" data-id="${league.admin}"></div>
                        ${app.browser.returnAddressHTML(league.admin)}
                        <div id="admin_contact" class="saito-userline" data-id="${
	league.admin
}">${league.contact}</div>
                        ${
	newPlayer ||
							league.unverified ||
							(league.admin && !isMember)
		? `<button id="league-chat-button" class="saito-user-fourth-elem-large">League Chat</button>`
		: ''
}
                    </div>`;

			if (newPlayer || league.unverified || !isMember) {
				html += `<div id="admin_welcome" class="league-overlay-content-box ${
					!isMember ? 'hidden' : ''
				}">${league.welcome}</div>`;

				html += `<div id="admin_note" class="contactAdminWarning league-overlay-content-box">
                            <div><i class="fas fa-exclamation-triangle"></i>Warning</div>`;
				if (!isMember) {
					html += `<div class="error_line"><span>You aren't a member of the league <span class="join_league attention">Join here</span></span></div>`;
				} else {
					if (newPlayer) {
						html += `<div class="error_line"><span>Please backup your account. <span class="backup_account attention">Enable login</span></span></div>`;
					}
					if (league.unverified && !league?.email_sent) {
						html += `<div class="error_line"><span class="contact_admin attention">Message the admin</span> for full access to the league</div>`;
					}
				}

				html += `</div>`;
			}
		}
	}

	html += `<div class="league-overlay-controls`;

	let extra_class =
		newPlayer || league.unverified || (league.admin && !isMember)
			? ' hidden'
			: '';

	if (league.admin && league.admin == mod.publicKey) {
		extra_class = '';
	}

	html += extra_class + `">`;

	if (league.admin == mod.publicKey) {
		html += `<button id="league-invite-button" class="saito-button saito-button-primary">invite link</button>`;
	}
	if (league.admin) {
		html += `<button id="league-chat-button" class="saito-button saito-button-primary">league chat</button>`;
	}

	html += `<button id="league-overlay-create-game-button" 
					class="saito-button saito-button-primary${league.admin && !isMember ? ' hidden' : ''}">`;
	if (game_mod.maxPlayers === 1 && !game_mod.returnSingularGameOption() && !game_mod.returnAdvancedOptions()){
		html += "play game";
	}else{
		html += "create game";
	}

	html +=`</button>
             </div>

            </div>
                <div class="league-overlay-leaderboard league-overlay-content-box hide-scrollbar mobile-hide"></div>
            </div>
        </div>
 
    `;

	return html;
};
