module.exports = (app, mod) => {

    let html = `<div class="overlay-input">
      <label for="clock">Time Limit:</label>
      <select name="clock">
        <option value="0" default>no limit</option>
        <option value="1">1 minute</option>
        <option value="2">2 minutes</option>
        <option value="10">10 minutes</option>
        <option value="30">30 minutes</option>
        <option value="60">60 minutes</option>
        <option value="90">90 minutes</option>
        <option value="120">120 minutes</option>
      </select>
      </div>
      `;
    return html;

}

