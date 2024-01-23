module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
              <h1>Saito Run</h1>
                <ul>
                  <li>Collect cubes and navigate through obstacles</li>
                  <li>use left/ right arrows (or swipe left/ right on mobile) to move left/ right</li>
                  <li>Use space bar to jump and down arrow (swipe down on mobile) to dive</li>
                </ul>
            </div>
            `;

	return html;
};
