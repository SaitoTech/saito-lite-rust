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


    /*let html = `
          <div class="overlay-input">
          <label for="theme">Game Version:</label>
          <select name="theme">
            <option value="classic" selected title="Familiar version of the game with ore, wheat, bricks, wood and sheep">Classic</option>`;
    //<option value="elements" title="Magical version of game where players cultivate the five elements (earth, fire, water, metal, and wood)">Elemental</option>
    html += `</select>
          </div>
    `;*/

    return html;

}

