
  returnAgendaCards() {
    return this.agenda_cards;
  }

  
  importAgendaCard(key, obj) {

    if (obj.name == null) 	{ obj.name = "Unknown Agenda"; }
    if (obj.type == null)	{ obj.type = "Law"; }
    if (obj.text == null)	{ obj.text = "Unknown Document"; }
    if (obj.img  == null)	{ obj.img = "/imperium/img/agenda_card_template.png"; }
    if (obj.key  == null)	{ obj.key = name; }
    if (obj.elect == null)	{ obj.elect = "other"; }

    if (obj.returnCardImage == null) {
      obj.returnCardImage = function() {
        return `
  	  <div class="agenda-card agenda-card-${key} card option ${key}" id="${key}">
	    <div class="agenda-card-title">${obj.name}</div>
	    <div class="agenda-card-content">${obj.text}</div>
	  </div>
        `;
      }
    }

    obj = this.addEvents(obj);
    this.agenda_cards[key] = obj;

  }  

