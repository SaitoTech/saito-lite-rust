module.exports = (lesson, sentence, popup_mod) => {

	let s = sentence.sentence_text.replaceAll('\\', '');
	let s2 = sentence.sentence_text.replaceAll('\\', '');
	let p = sentence.speaker_text.replaceAll('\\', '');

	let pinyin_visible = "none"
	let english_visible = "none"

	if (popup_mod.app.options.popup.display.pinyin == 1) { pinyin_visible = "block"; }
	if (popup_mod.app.options.popup.display.english == 1) { english_visible = "block"; }

	try {
		s2 = switch_display_mode_in_string(s2, "pinyin", "simplified");
		if (popup_mod.app.options.popup.display.traditional == 1) {
			s  = switch_display_mode_in_string(s, "traditional", "simplified");
			p  = switch_display_mode_in_string(p, "traditional", "simplified");
		}
	} catch (err) {
	}

	return `
    <tr class="sentence">
      <td class="sentence-player"></td>
      <td class="sentence-speaker">${p}</td>
      <td class="sentence-data">
	<div class="lesson_sentence_source" id="lesson_sentence_source_${sentence.id}">${s}</div>
	<div class="lesson_sentence_pinyin" id="lesson_sentence_pinyin_${sentence.id}" style="display:${pinyin_visible}">${s2}</div>
	<div class="lesson_sentence_translation" id="lesson_sentence_translation_${sentence.id}" style="display:${english_visible}">${sentence.sentence_translation}</div>
      </td>
    </tr>
  `;
}; 
