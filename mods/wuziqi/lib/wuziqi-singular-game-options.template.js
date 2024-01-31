module.exports = (app, mod) => {
	let html = `<div class="overlay-input">
        <label for="best_of">Best of:</label>
        <select name="best_of">
          <option value="1">1</>
          <option value="3" selected>3</>
          <option value="5">5</>
          <option value="7">7</>
          <option value="9">9</>
          <option value="11">11</>
          <option value="13">13</>
          <option value="15">15</>
        </select></div>`;

	return html;
};
