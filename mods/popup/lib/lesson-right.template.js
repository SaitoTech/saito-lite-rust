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


	<form name="text_controls">	
	<br>
	<input type="radio" name="display_select" onclick="switch_display_mode('simplified')" value="simplified" checked=""> simplified <span class="red">漢字</span>
	<br>
	<input type="radio" name="display_select" onclick="switch_display_mode('traditional)" value="traditional"> traditional <span class="red">漢字</span>
	</form>

	<p> </p>

	<div style="margin-top:15px;margin-bottom:15px;margin-left:30px;clear:both;">
	<input type="checkbox" id="display_english" onclick="switch_display_mode('english')" checked=""> display translation
	<br>
	<input type="checkbox" id="display_pinyin" onclick="switch_display_mode('pinyin')" checked=""> display pinyin
	
	</div>


	</div>

   `;
};
