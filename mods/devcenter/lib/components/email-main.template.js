module.exports = EmailMainTemplate = (app, mod) => {

  let html = `
    <div id="email-main" class="email-main">
      <div class="welcome-container">

        <h2>Welcome to the Saito Development Center</h2>

        <p></p>

	Everything on Saito is a blockchain application. This interface is an application. The Saito Arcade is an application. All of the games in the Saito Arcade are also modules. The chatbox is a module. And when you install other cryptocurrency, you are adding applications that teach Saito how to connect to those chains and make transfers for you.

        <p></p>

	This application is for developers and advanced users. Come here to install new Saito applications, modify applications you have already installed, and develop and upload new applications to the network. To start exploring the applications available and get a sense of what is possible click on the "AppStore" link in the left-hand menu. If you are here to change your existing application bundle, customize your wallet by clicking on "Settings".

        <p></p>

        If you are interested in developing on Saito, a good place to start is our tutorial series that explains how to build simple applications. It takes about five minutes to build your first Saito application. Once you have developed your application, you can upload it to the network where it will be available to any Saito AppStore running anywhere on the blockchain.

        <p></p>

        Curious more about how Saito works? A good place to start is our off-chain Saito Wiki, which includes practical description of how the network works. For other great resources, we recommend visiting the <a href="https://github.com/0xluminous/awesome-saito" target="_awesome">Awesome Saito</a> or the <a href="https://saitofaqs.com/" target="_saitofaqs">Saito FAQ</a> page...

      </div>
    </div>
  `;

  //
  // preload scripts
  //
  let mods = app.modules.respondTo("email-appspace");
  for (let i = 0; i < mods.length; i++) {
    let tmod = mods[i];
    if (tmod != null) {
      if (tmod.script != "" && tmod.script !== "undefined" && tmod.script != undefined) {
        html += tmod.script;
      }
    }
  }

  return html;

}
