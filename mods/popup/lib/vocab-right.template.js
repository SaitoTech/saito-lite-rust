module.exports = () => {
	return `

	<form style="margin-left: 80px;margin-top:0px;">
        <br>
        <input id="checkbox_field3" type="checkbox" onclick="toggle_vocab_mode('field3')" value="field3" checked=""> traditional <span class="red">漢字</span>
        <br>
        <input id="checkbox_field2" type="checkbox" onclick="toggle_vocab_mode('field2')" value="field2" checked=""> romanized <span class="red">pinyin</span>
        <br>
        <input id="checkbox_field1" type="checkbox" onclick="toggle_vocab_mode('field1')" value="field1" checked=""> english <span class="red">translation</span>
        <br>
        <input id="checkbox_field5" type="checkbox" onclick="toggle_vocab_mode('field5')" value="field5" checked=""> extra <span class="red">notes</span>
        </form>

        <br>
        <div class="start_popup_review">start review</div>
	

   `;
};
