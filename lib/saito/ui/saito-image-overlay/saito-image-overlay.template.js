module.exports  = (app, mod) => {
	let html = `
    <div class="saito-img-arrow-box left" id="saito-img-arrow-box-left">
      <i class="saito-img-icon fa-solid fa-arrow-left"></i>
    </div>
    <div class="saito-img-arrow-box right" id="saito-img-arrow-box-right">
      <i class="saito-img-icon fa-solid fa-arrow-right"></i>
    </div>
    <div class='saito-overlay-img-cont' id='saito-overlay-img-cont'></div>
  `;

	return html;
};
