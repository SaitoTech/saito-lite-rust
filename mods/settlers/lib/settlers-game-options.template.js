module.exports = (app, mod) => {

  let html =  `
        <div class="overlay-input">
            <label for="game_length ">Game Length:</label>
            <select name="game_length">
              <option value="8" >8 VP - for a quick sprint</option>
              <option value="10" selected>10 VP - standard game</option>
              <option value="12">12 VP - marathon</option>
            </select>
        </div>
    `;

    return html;

}

