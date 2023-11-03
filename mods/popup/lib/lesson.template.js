module.exports = (lesson) => {

   return `
     <div class="lesson-container">

       <div class="lesson-section discussion">${unescape(lesson.content)}</div>

       <div class="lesson-section transcript"></div>

       <div class="lesson-section vocabulary"></div>

       <div class="lesson-section writing"></div>

       <div class="lesson-section questions"></div>

     </div>
     <div class="lesson-sidebar">

       <img id="podcast_photo" src="http://popupchinese.com/data/${lesson.id}/image.jpg" class="podcast_photo">
       <audio controls="" style="margin-top:5px">
         <source src="http://popupchinese.com/data/${lesson.id}/audio.mp3" type="audio/mpeg">
         Your browser does not support the audio element.
       </audio> 
 
     </div>

  </div>


   `;

}

