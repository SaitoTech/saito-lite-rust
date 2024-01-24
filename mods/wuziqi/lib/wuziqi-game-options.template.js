module.exports = (app, mod) => {
	let html = `<h1 class="overlay-title">Wuziqi Options</h1>`;

	html += `<div class="overlay-input">
                    <label for="board_size">Board Size:</label>
                    <select name="board_size">
                        <option value="9">9</>
                        <option value="11">11</>
                        <option value="13" selected>13</>
                        <option value="15">15</>
                        <option value="17">17</>
                        <option value="19">19</>
                        <option value="21">21</>
                        <option value="23">23</>
                        <option value="25">25</>
                    </select>
                </div>`;

	return html;
};
