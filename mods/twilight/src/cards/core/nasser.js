

    //
    // NASSER
    //
    if (card == "nasser") {

      let original_us = parseInt(this.countries["egypt"].us);
      let influence_to_remove = 0;

      while (original_us > 0) {
        influence_to_remove++;
        original_us -= 2;
      }

      this.removeInfluence("egypt", influence_to_remove, "us");
      this.placeInfluence("egypt", 2, "ussr");
      this.updateStatus("Nasser - Soviets add two influence in Egypt. US loses half (rounded-up) of all influence in Egypt.");
      
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;


    }



