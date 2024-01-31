module.exports = () => {
	let html = `

      <div style="padding:40px;width:100vw;height:100vh;overflow-y:scroll;display:grid;grid-template-columns: 200px auto">
        <div style="top:0;left:0;">

            <label for="player1">Play as:</label>
            <select name="player1">
              <option value="random" selected>random</option>
              <option value="ussr">Protestants</option>
              <option value="us">Papacy</option>
            </select>

            <label for="scenario">Scenario:</label>
            <select name="scenario" id="scenario">
              <option value="original">original</option>
              <option value="1517" selected>1517 - long game</option>
              <option value="1532">1532 - shorter game</option>
              <option value="tournament">1532 - tournament</option>
              <option value="is_testing">TESTING</option>
            </select>

        </div>
    </div>

          `;

	return html;
};
