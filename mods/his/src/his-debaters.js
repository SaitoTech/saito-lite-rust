
  
  returnDebaters(faction="papacy", type="uncommitted") {
    let debaters = [];
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (faction == "papacy") {
        if (this.game.state.debaters[i].faction == faction) {
	  if (type == "uncommitted" && this.game.state.debaters[i].committed != 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	  if (type == "committed" && this.game.state.debaters[i].committed == 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	}
      } else {
        if (this.game.state.debaters[i].faction != "papacy") {
	  if (type == "uncommitted" && this.game.state.debaters[i].committed != 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	  if (type == "committed" && this.game.state.debaters[i].committed == 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	}
      }
    }
    return debaters;
  }



