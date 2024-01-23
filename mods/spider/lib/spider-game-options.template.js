module.exports = (app, mod) => {
	let saved_dif = app?.options?.gameprefs?.spider_difficulty || 'medium';
	console.log(saved_dif);
	let html = `<select name="difficulty">
            <option value="easy">Easy (1 suit) </option>
            <option value="medium">Medium (2 suits) </option>
            <option value="hard">Hard (4 suits) </option>
          </select>`;
	return html.replace(`${saved_dif}"`, `${saved_dif}" selected`);
};
