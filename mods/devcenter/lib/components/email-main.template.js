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
          <div class="">
            Not a developer? Please help us use and improve the Saito Applications. We also ask supporters to spend time learning how Saito works - we need more brains focused on improving Saito Consensus in order to improve scalability, optimize consensus, and increase cost-of-attack against the blockchain.
            </div>
          <div>
          <div class="learn">
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

