
module.exports = RedSquareImageOverlayTemplate = (app, mod) => {

  let html = `
    <div class="tweet-img-arrow-box left" id="tweet-img-arrow-box-left">
      <i class="tweet-img-icon fa-solid fa-arrow-left"></i>
    </div>
    <div class='tweet-overlay-img-cont' id='tweet-overlay-img-cont'></div>
    <div class="tweet-img-arrow-box right" id="tweet-img-arrow-box-right">
      <i class="tweet-img-icon fa-solid fa-arrow-right"></i>
    </div>
  `;

  return html;

}