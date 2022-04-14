module.exports = (app, mod) => {
    return `
        <div class="invite-overlay-container">
      <div class="invite-overlay">
        <div class="invite-link">
          <div class="invite-link-actions">
            <div>
              <i
                id="copy-invite-link"
                class="fa fa-clipboard"
                aria-hidden="true"
              ></i>
            </div>
            <div class="social-links">
              <img class="share" src="/saito/img/invite/facebook.png" />
              <img class="share" src="/saito/img/invite/instagram.png" />
              <img class="share" src="/saito/img/invite/twitter.png" />
            </div>
          </div>

          <p class="invite-link-text">

          </p>
          <button class="close-invite-link">Close</button>
        </div>
      </div>
    </div>
        `
}