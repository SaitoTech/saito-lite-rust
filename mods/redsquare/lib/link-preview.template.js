module.exports = (tweet) => {

  if (typeof tweet.youtube_id != "undefined" && tweet.youtube_id != "") {
  
    return `
	    <div class="youtube-embed-container">
	      <iframe class="youtube-embed" src="https://www.youtube.com/embed/${tweet.youtube_id}"></iframe>
	    </div>
	  `;
  
  } else if (tweet.link_properties != null) {

    return `
	<div class="link-preview">
          <a target="_blank">
            <div class=" link-container">
              <div class="link-img" style="background: url(/saito/img/arcade/chess.jpg)"></div>
              <div class="link-info">
                <div class="link-url">www.instagram.com</div>
                <div class="link-title">Preview title</div>
                <div class="link-description">Preview description.</div>
              </div>
            </div>
          </a>
        </div>
    `;

  }
 
}

