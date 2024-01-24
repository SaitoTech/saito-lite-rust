module.exports = () => {
	let html = `
        <div class="overlay-input">


          <label for="deck">Deck:</label>
          <select name="deck" id="deckselect" onchange='
            if ($("#deckselect").val() == "saito") {
              $(".saito_edition").prop("checked",true);
              try {
                document.querySelector(".usbonus").value = 0;
              } catch (err) {
                console.log(err);
              }
              $(".endofhistory_edition").prop("checked", false);
            } else {
              $(".saito_edition").prop("checked", false);
              if ($("#deckselect").val() == "optional") {
                $(".optional_edition").prop("checked", false);
              } else {
                $(".optional").prop("checked", true);
                if ($("#deckselect").val() == "endofhistory") {
                  $(".endofhistory_edition").prop("checked",true);
                  $(".optional_edition").prop("checked", false);
                }
              }
            } '>
            <option value="original">original</option>
            <option class="late-war" value="late-war">late war</option>
            <option class="optional" value="optional" selected>optional</option>
            <option class="saito" value="saito">saito edition</option>
            <!---<option class="endofhistory" value="endofhistory">end of history</option>--->
          </select>
        </div>
          `;
	return html;
};
