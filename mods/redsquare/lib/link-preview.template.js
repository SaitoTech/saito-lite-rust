module.exports = (app, mod, tweet) => {

	let link_preview = ``;

	// if (tweet.link_properties != null) {
	// 	//
	// 	// if link properties
	// 	//
	// 	if (typeof tweet.link_properties != 'undefined') {
	// 	  if (tweet.link_properties['og:exists'] !== false) {
	// 	    let d = tweet.link_properties;
	// 	    if (d['og:url'] != '' && d['og:image'] != '') {
	// 	      let link = new URL(d['og:url']);
	// 	      link_preview = `
	// 				      <div class="link-preview">
	// 				        <a target="_blank" href="${d['og:url']}">
	// 				          <div class=" link-container">
	// 				            <div class="link-img" style="background: url(${d['og:image']})"></div>
	// 				            <div class="link-info">
	// 				              <div class="link-url">${link.hostname}</div>
	// 				              <div class="link-title">${d['og:title']}</div>
	// 				              <div class="link-description">${d['og:description']}</div>
	// 				            </div>
	// 				          </div>
	// 				        </a>
	// 				      </div>`;
	// 	    }
	// 	  }
	// 	}
	// }

	
  if (typeof tweet.youtube_id != "undefined" && tweet.youtube_id != "") {
  
	  link_preview = `
	  	<div class="youtube-embed-container">
	  		<iframe class="youtube-embed" src="https://www.youtube.com/embed/${tweet.youtube_id}"></iframe>
	  	</div>

	  `;
  
  } else if (tweet.link_properties != null) {
  	link_preview = `
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
        </div>`;
  }
 
	return 	link_preview;
}