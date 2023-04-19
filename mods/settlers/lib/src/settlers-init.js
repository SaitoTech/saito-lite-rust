
  /*
    Functions for initialization
  */

    class SettlersInit {
  //
  // OVERRIDE THIS FUNCTION FROM THE PARENT GAME LIBRARY TO CHANGE THE ACKNOWLEDGE TEXT TO CONTINUE
  //
  playerAcknowledgeNotice(msg, mycallback) {
    let html = `<ul><li class="textchoice acknowledge" id="confirmit">continue...</li></ul>`;
    try {
      this.updateStatusWithOptions(msg, html);
      this.attachCardboxEvents();
      document.querySelectorAll(".acknowledge").forEach((el) => { 
        el.onclick = (e) => {
          // if player clicks multiple times, don't want callback executed multiple times
          document.querySelectorAll(".acknowledge").forEach((el) => { el.onclick = null; });
          mycallback();
        };
      });
    } catch (err) {
      console.error("Error with ACKWNOLEDGE notice!: " + err);
    }
    return 0;
  }


}

module.exports = SettlersInit;