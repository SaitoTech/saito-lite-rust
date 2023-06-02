module.exports = () => {

  let html =  `
            <div class="overlay-input">
              <select name="player1">
                <option value="random" selected>random sides</option>
                <option value="ussr">play as USSR</option>
                <option value="us">play as US</option>
              </select>
            </div>
          `;
    return html;

}