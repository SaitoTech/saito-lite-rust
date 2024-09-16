module.exports = (lesson, word) => {
	return `
    <tr class="word">
      <td class="player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('${word.audio_source}',this);"></td>
      <td class="lesson_word_field1">${word.field1}</td>
      <td class="lesson_word_field2">${word.field2}</td>
      <td class="lesson_word_field3">${word.field3}</td>
      <td class="lesson_word_field4">${word.field4}</td>
      <td class="lesson_word_field5">${word.field5}</td>
    </tr>
  `;
};
