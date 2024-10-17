module.exports = (html) => {
	return `
    <div class="game-slider" style="visibility:hidden;">
      <section class="carousel">
        <button class="slider-button slider-button-prev" data-slide-direction="prev">⏴</button>
        <button class="slider-button slider-button-next" data-slide-direction="next">⏵</button>

        ${html}

        </section>
    </div>`;
};
