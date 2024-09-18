module.exports = () => {
	return `

	<form style="margin-left: 80px;margin-top:0px;">
        <br>
        <input id="checkbox_field2" type="checkbox" onclick="enable_display_mode('field2')" value="field2" checked=""> traditional <span class="red">漢字</span>
        <br>
        <input id="checkbox_field3" type="checkbox" onclick="enable_display_mode('field3')" value="field3" checked=""> romanized <span class="red">pinyin</span>
        <br>
        <input id="checkbox_field4" type="checkbox" onclick="enable_display_mode('field4')" value="field4" checked=""> english <span class="red">translation</span>
        <br>
        <input id="checkbox_field5" type="checkbox" onclick="enable_display_mode('field5')" value="field5" checked=""> extra <span class="red">notes</span>
        </form>

	

   `;
};
