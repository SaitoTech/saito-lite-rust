const ScheduleOverlayTemplate = require("./saito-scheduler.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const SaitoInviteTemplate = require("./../saito-invite/saito-invite.template");


class SchedulerOverlay {

  constructor(app, mod) {
    this.app 		= app;
    this.name 		= "SchedulerOverlay";
    this.overlay        = new SaitoOverlay(this.app);
    this.mycallback     = null;
    this.options = {};

  
    const d = new Date();
    let utcOffset = d.getTimezoneOffset(); // returns offset in minutes

    this.options.default_utc_offset = -(utcOffset/60); //convert offset minutes to UTC 
    this.options.default_utc_sign = (Math.sign(this.options.default_utc_offset) == 1) ? '+' : '-';
    this.options.default_utc_value = this.options.default_utc_sign+this.options.default_utc_offset;

    console.log("Current UTC");
    console.log(this.options.default_utc_value);
  }

  render(app, mod, mycallback=null) {
    if (mycallback != null) { this.mycallback = mycallback; }
    this.overlay.show(app, mod, ScheduleOverlayTemplate(app, mod, this.options));

    //
    // identify modules that support InviteModTemplate and insert them 
    // into the select somehow.
    //



    this.attachEvents(app, mod, this.mycallback);
  }


  attachEvents(app, mod, mycallback){

    // document.getElementById("").onclick = (e) => {

    //   let data = { timestamp : (new Date().getTime()) };
    //   if (this.mycallback != null) { this.mycallback(app, mod, data); }
    //   this.overlay.hide();

    // }

    document.getElementById("scheduler-overlay-next-btn").onclick = (e) => {
      let type = document.getElementById("schedule-type").value;
      let datetime = document.getElementById("schedule-datetime-input").value;
      let desc = document.getElementById("schedule-desc").value;

      alert("Schedule type: "+type+" - when: "+datetime+" UTC "+this.options.default_utc_value+" - details: "+desc);
    }

    document.querySelector('.schedule-input-container .saito-user').onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.overlay.show(app, mod, SaitoInviteTemplate(app, mod));
    }

    // document.addEventListener('click', function(e) {      
    //   alert('clicked');
    //   console.log(e.target);

    //   if(e.target && e.target.id== 'invite-private-container'){
        
    //     document.getElementById('invite-private-input-container').style.display = 'block';
    //     document.getElementById('invite-public-container').style.display = 'none';
    //   }
    // });

    document.querySelector('#invite-private-container').onclick = (e) => {
      alert('clicked');
      document.getElementById('invite-private-input-container').style.display = 'block';
      document.getElementById('invite-public-container').style.display = 'none';
    }

  }

}

module.exports = SchedulerOverlay;

