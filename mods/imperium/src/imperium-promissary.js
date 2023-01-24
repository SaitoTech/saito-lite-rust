  
  returnPromissaryNotes() {
    return this.promissary_notes;
  }
  
  importPromissary(name, obj) {

    if (obj.name == null) 	{ obj.name = "Unknown Promissary"; }
    if (obj.text == null)	{ obj.text = "Unknown Promissary"; }
    if (obj.key == null)	{ obj.key = name; }

    obj = this.addEvents(obj);
    this.promissary_notes[name] = obj;

  }  

  returnPromissaryPlayer(promissary) {

    let tmpar = promissary.split("-");
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.game.state.players_info[i].faction === tmpar[0]) { return (i+1); }
    }

    return -1;

  }
  



