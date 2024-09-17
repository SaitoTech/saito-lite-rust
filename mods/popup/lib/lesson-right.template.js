module.exports = (lesson) => {

	let intro = lesson.content.replaceAll('\\', '');
	intro = intro.replaceAll('\n\n', '<p></p>');

	return `
     <div class="lesson-sidebar">
       <img id="podcast_photo" src="http://popupchinese.com/data/${lesson.id}/image.jpg" class="podcast_photo">
       <audio controls="" style="margin-top:5px">
         <source src="http://popupchinese.com/data/${lesson.id}/audio.mp3" type="audio/mpeg">
         Your browser does not support the audio element.
       </audio> 
     </div>


     <form class="text_controls">	

	<br />
	<input type="radio" name="display_select" onclick="switch_display_mode('simplified')" value="simplified" checked=""> simplified <div style="display:inline" class="red">漢字</div>

	<br />
	<input type="radio" name="display_select" onclick="switch_display_mode('traditional')" value="traditional"> traditional <div style="display:inline" class="red">漢字</div>
      </form>

      <form class="vocab_controls">

	<br />
	<input type="checkbox" id="display_english" onclick="switch_display_mode('english')" checked=""> display translation

	<br />
	<input type="checkbox" id="display_pinyin" onclick="switch_display_mode('pinyin')" checked=""> display pinyin

      </div>



   `;
};
