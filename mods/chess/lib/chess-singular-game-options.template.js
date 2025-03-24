module.exports = (app, mod) => {
	let html = `<div class="overlay-input">
      <select name="clock">
        <option value="0" default>no clock</option>
        <option value="1">1 minute</option>
        <option value="2">2 minutes</option>
        <option value="5">5 minutes</option>
        <option value="10">10 minutes</option>
        <option value="30">30 minutes</option>
        <option value="60">60 minutes</option>
      </select>
      </div>
      `;
	return html;
};
