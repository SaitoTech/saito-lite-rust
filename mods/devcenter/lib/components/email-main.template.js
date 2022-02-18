module.exports = EmailMainTemplate = (app, mod) => {

  let html = `
    <div id="email-main" class="email-main">
      <div id="email-appspace" class="email-appspace">
        <div class="welcome-container">
          <h2>Dev Center</h2>

          <div class="welcome">
            <h4>Welcome</h4>
            The Saito Arcade is a modular application stack. This, chat, the forum and games are all modules that run on the Saito chain. This developer center features tools and training on building on the Saito Arcade Stack.
          </div>
          <div class="actions">
            <div class="install">
              <i class="fas fa-download"></i>
              Install&nbsp;Apps
            </div>
            <div class="tutorials">
              <a href="https://org.saito.tech/tutorial-1-deploy-a-new-application/" target="_blank">
                <i class="fas fa-graduation-cap"></i>
                Tutorials
                </a>
            </div>
            <div class="wallet">
              <i class="fas fa-wallet"></i>
              Manage Wallet
            </div>
          </div>
          <div class="learn">
            <h4>Learn Saito and Join In</h4>
            <div>
              <div class="welcome-link"><a href="https://github.com/0xluminous/awesome-saito">Awesome Saito</a></div>
              <div class="welcome-text">A community-curated collection of resources explaining what Saito is and how it works.</div>
            </div>
            <div>
              <div class="welcome-link"><a href="https://saitofaqs.com">Saito FAQ</a></div>
              <div class="welcome-text">Got questions? We have answers to the most frequently asked on this page.</div>
            </div>
            <div>
              <div class="welcome-link"><a href="https://saito.io/saito-whitepaper.pdf">Saito Whitepaper</a></div>
              <div class="welcome-text">The original whitepaper that got everything started.</div>
            </div>
            <div>
              <div class="welcome-link"><a href="https://t.me/SaitoIO">Saito Telegram</a></div>
              <div class="welcome-text">Our Official Saito Telegram Group. There are fake ones, but this is the real one.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  return html;

}

