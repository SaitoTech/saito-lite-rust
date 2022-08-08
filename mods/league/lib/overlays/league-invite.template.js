module.exports = (app, mod, league, link = "") => {

    return `
        <div class="invite-link">
          <div class="invite-link-actions">
            <div>
              <i id="copy-invite-link" class="fa fa-clipboard" aria-hidden="true"></i>
            </div>
            <!--div class="social-links">
              <img src="/saito/img/invite/facebook.png" />
              <img src="/saito/img/invite/instagram.png" />
              <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" target="_blank" class="twitter-share-button" data-show-count="false" data-text="Come join the ${league.name} League on the Saito Arcade" data-url=${link}><img src="/saito/img/invite/twitter.png" /></a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
            </div-->
          </div>

          <p id="invite-link-text" class="invite-link-text">${link}</p>
       
        </div>
        `
}

/* data-text="Play this game with me" data-url="https://saito.io/arcade" */