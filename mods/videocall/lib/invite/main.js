
class StunxCreator {

  constructor(app, mod) {
    this.app = app;
    this.name = "StunxCreator";
  }

  render(app, mod) {

    let invite_obj = mod.options;
    mod.createOpenTransaction(invite_obj);

    alert("event / invitation sent");

  }

}


module.exports = StunxCreator;


