module.exports = (lesson, word, popup_self) => {

    let as = "";
    if (word.audio_source) { as = word.audio_source; }

    let df1 = "";
    let df2 = "";
    let df3 = "";
    let df4 = "";
    let df5 = "";

    if (popup_self.app.options.popup.vocab.field1 == 0) { df1 = "none"; }
    if (popup_self.app.options.popup.vocab.field2 == 0) { df2 = "none"; }
    if (popup_self.app.options.popup.vocab.field3 == 0) { df3 = "none"; }
    if (popup_self.app.options.popup.vocab.field4 == 0) { df4 = "none"; }
    if (popup_self.app.options.popup.vocab.field5 == 0) { df5 = "none"; }

    try {
    	if (popup_mod.app.options.popup.display.traditional == 1) { 
        	s = switch_display_mode_in_string(s, "traditional", "simplified");
                p = switch_display_mode_in_string(p, "traditional", "simplified");
        }
    } catch (err) {
    }

    return `
    	<tr class="word">
    	  <td class="player"><img src="/popup/img/buttons/play_button.gif" onclick="playWordAudio('${as}',this);"></td>
    	  <td class="lesson_word_field4 field4" style="display:${df4}">${word.field4}</td>
    	  <td class="lesson_word_field3 field3" style="display:${df3}">${word.field3}</td>
    	  <td class="lesson_word_field1 field1" style="display:${df1}">${word.field1}</td>
    	  <td class="lesson_word_field2 field2" style="display:${df2}">${word.field2}</td>
    	  <td class="lesson_word_field5 field5" style="display:${df5}">${word.field5}</td>
    	</tr>
    `;

};
