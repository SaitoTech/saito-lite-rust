module.exports = (lesson) => {
	return `
    <div class="teaser" id="${lesson.id}">
      <div class="photo" style="background-image: url('http://popupchinese.com/data/${lesson.id}/teaser.jpg');"></div>
      <div class="title">
        <div class="black nonlink" href="/lessons/${lesson.userslug}/${lesson.slug}">${lesson.title}</div>
        <div class="level red">${lesson.userslug}</div>
      </div>
    </div>
  `;
};
