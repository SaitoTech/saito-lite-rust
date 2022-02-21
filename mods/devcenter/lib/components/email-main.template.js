module.exports = EmailMainTemplate = (app, mod) => {

  let html = `
    <div id="email-main" class="email-main">
      <div id="email-appspace" class="email-appspace">
        <div class="welcome-container">
          <h2>Saito Development Center</h2>

          <div class="welcome">
            Saito is a platform for running in-browser blockchain applications like the Saito Arcade, Appstore, and Saito Chat programs. If you are a developer you can find developer tools and documentation here or learn how you can help.
          </div>
          <div class="actions">
            <div class="install" onclick="document.getElementById('email-nav-AppStore').click();">
              <i class="fas fa-download"></i>
              install apps
            </div>
            <div class="tutorials">
              <a href="https://org.saito.tech/tutorial-1-deploy-a-new-application/" target="_blank">
                <i class="fas fa-graduation-cap"></i>
                tutorials
                </a>
            </div>
            <div class="wallet" onclick="document.getElementById('email-nav-Settings').click();">
              <i class="fas fa-wallet"></i>
              wallet settings
            </div>
          </div>
          <div class="" style="margin-bottom:15px">
            Curious how Saito works? We recommend the following resources for learning what Saito is and why it matters. Be warned: once you start down the Saito rabbit-hole you will never look at proof-of-work and proof-of-stake networks the same way again!
          </div>
          <div class="learn">
            <div>
              <div class="welcome-link"><a href="https://github.com/0xluminous/awesome-saito">Awesome Saito</a></div>
              <div class="welcome-text">A community-curated collection of resources explaining what Saito is and how it works.</div>
            </div>
            <div>
              <div class="welcome-link"><a href="https://saitofaqs.com">Saito FAQ</a></div>
              <div class="welcome-text">Got questions? Find answers to the most frequently asked on this page.</div>
            </div>
            <div>
              <div class="welcome-link"><a href="https://saito.io/saito-whitepaper.pdf">Saito Whitepaper</a></div>
              <div class="welcome-text">Original description of Saito network consensus mechanism</div>
            </div>
            <div>
              <div class="welcome-link"><a href="https://t.me/SaitoIO">Saito Telegram</a></div>
              <div class="welcome-text">Our Official Saito Telegram Group.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  return html;

}

