
module.exports = LimboSideBarTemplate = (app, mod, dreamer) => {
	if (!dreamer || !mod.dreams[dreamer]) {
		console.log("Clear sidebar");
		return '';
	}

	return `
	<div id="limbo-sidebar" class="limbo-sidebar">
    	<div class="saito-modal-content hide-scrollbar"></div>
    </div>`;

};
