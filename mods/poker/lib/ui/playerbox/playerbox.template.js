module.exports = PlayerboxTemplate = (p) => {
	return `
	  <div class="playerbox playerbox-${p}" id="playerbox-${p}" data-id="${p}">
	  </div>
	`;
};
