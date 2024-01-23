module.exports = (app, mod) => {
	let privacy = app.options.stun?.settings?.privacy || 'all';
	return `
			<fieldset class="saito-grid">
			<legend class="settings-label">Who can P2P call you with Saito Talk?</legend>
			<input type="radio" id="all" name="stun-privacy" value="all" ${
	privacy == 'all' ? 'checked' : ''
}/>
			<label for="all">Anyone</label>
			<input type="radio" id="key" name="stun-privacy" value="key" ${
	privacy == 'key' ? 'checked' : ''
}/>
			<label for="key">Acquaintances</label>
			<input type="radio" id="dh" name="stun-privacy" value="dh" ${
	privacy == 'dh' ? 'checked' : ''
}/>
			<label for="dh">Friends</label>
			<input type="radio" id="none" name="stun-privacy" value="none" ${
	privacy == 'none' ? 'checked' : ''
}/>
			<label for="none">No one</label>
			</fieldset>
			`;
};
