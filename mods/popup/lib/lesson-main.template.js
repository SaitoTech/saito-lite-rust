module.exports = (lesson) => {

	let intro = lesson.content.replaceAll('\\', '');
	intro = intro.replaceAll('\n\n', '<p></p>');

	return `
       <div class="lesson-container">

       <div class="lesson-header"><div class="user">${lesson.username}</div> - <div class="title">${lesson.title}</div></div>

       <div class="lesson-section discussion">${intro}</div>

       <div class="lesson-section transcript"></div>

       <div class="lesson-section vocabulary"></div>

       <div class="lesson-section writing"></div>

       <div class="lesson-section questions"></div>

       </div>

   `;
};
