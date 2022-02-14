module.exports = EmailMainTemplate = (app, mod) => {

  let html = `
    <div id="email-main" class="email-main">
      <div id="email-appspace" class="email-appspace">
        <div class="welcome-container">
          <h2>Welcome to the Saito Development Center</h2>
          <div class="welcome-right-sidebar">

            <div class="welcome-link"><a href="https://github.com/0xluminous/awesome-saito">Awesome Saito</a></div>
            <div class="welcome-text">A community-curated collection of resources explaining what Saito is and how it works.</div>

	    <p></p>

            <div class="welcome-link"><a href="https://saitofaqs.com">Saito FAQ</a></div>
            <div class="welcome-text">Got questions? We have answers to the most frequently asked on this page.</div>

	    <p></p>

            <div class="welcome-link"><a href="https://saito.io/saito-whitepaper.pdf">Saito Whitepaper</a></div>
            <div class="welcome-text">The original whitepaper that got everything started. Warning: not light reading!</div>

	    <p></p>

            <div class="welcome-link"><a href="https://t.me/SaitoIO">Saito Telegram</a></div>
            <div class="welcome-text">Our Official Saito Telegram Group. There are fake ones, but this is the real one.</div>

          </div>

  	  Everything on Saito is an application that runs in your browser. This "website" is an application. The Arcade is an application. All of the games are applications. The chatbox is an application. And when you install other cryptocurrencies, you are adding applications that connect to other cryptocurrencies.

          <p></p>

	  This development center is an application for developers and advanced users. It lets you install new applications, manage your wallet, and build and upload Saito applications. Important applications will install links in your left-hand menu, like the "AppStore" that lets you install and upload new applications, and the "Settings" menu that lets you manage your existing wallet.

          <p></p>

          Want to build your own application? A good place to start is our tutorial series that explains how to build simple applications. It takes about five minutes to build your first module. Once you have developed your application, you can upload it to the network where it will be available to any Saito AppStore running anywhere on the blockchain.

          <p></p>

          Curious more about how Saito works? A good place to start is our off-chain Saito Wiki, which includes practical description of how the network works. For other great resources, we recommend visiting the <a href="https://github.com/0xluminous/awesome-saito" target="_awesome">Awesome Saito</a> or the <a href="https://saitofaqs.com/" target="_saitofaqs">Saito FAQ</a> page...

        </div>
      </div>
    </div>
  `;

  return html;

}
