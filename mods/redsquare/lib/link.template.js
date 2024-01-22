module.exports = (link) => {

    return `
	<div class="link-preview">
          <a target="_blank" href="${link.url}">
            <div class=" link-container">
              <div class="link-img" style="background: url(${link.src}); background-position: center;${link.set_height ? " height: 2.5rem;": ""}"></div>
              <div class="link-info">
                <div class="link-url">${link.url}</div>
                <div class="link-title">${link.title}</div>
                <div class="link-description">${link.description}</div>
              </div>
            </div>
          </a>
        </div>
    `;

}

