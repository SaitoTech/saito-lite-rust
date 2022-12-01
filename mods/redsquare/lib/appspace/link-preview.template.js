module.exports = (app, mod, tweet) => {

	let link_preview = ``;

	if (tweet.link_properties != null) {
		//
		// if link properties
		//
		if (typeof tweet.link_properties != 'undefined') {
		  if (tweet.link_properties['og:exists'] !== false) {
		    let d = tweet.link_properties;
		    if (d['og:url'] != '' && d['og:image'] != '') {
		      let link = new URL(d['og:url']);
		      link_preview = `
					      <div class="link-preview">
					        <a target="_blank" href="${d['og:url']}">
					          <div class=" link-container">
					            <div class="link-img" style="background: url(${d['og:image']})"></div>
					            <div class="link-info">
					              <div class="link-url">${link.hostname}</div>
					              <div class="link-title">${d['og:title']}</div>
					              <div class="link-description">${d['og:description']}</div>
					            </div>
					          </div>
					        </a>
					      </div>`;
		    }
		  }
		}
	}
    
 
	return 	link_preview;
}