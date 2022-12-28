const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoOverlay = require('../../lib/saito/new-ui/saito-overlay/saito-overlay');
//const CalendarAppspace = require('./lib/email-appspace/calendar-appspace');
const CalendarSidebar = require('./lib/sidebar');


class Calendar extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Calendar";
    this.description    = "Calendar for viewing and making appointments";
    this.categories     = "Utilities";

    this.appointments   = [];

    this.calendar       = null;
    this.overlay        = null;

    this.tiny_calendar_active = 0;
    this.overlay_calendar_active = 0;

    return this;
  }


  initialize(app) {
    this.overlay = new SaitoOverlay(app);
  }

  canRenderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      return true;
    }
    return false;
  } 

  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      if (!this.renderIntos[qs]) {
        let m = new CalendarSidebar(this.app, this, qs);
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(m);
      }

      this.styles = ['/saito/lib/fullcalendar/packages/core/main.css',
                     '/saito/lib/fullcalendar/packages/daygrid/main.css',
                     '/saito/lib/fullcalendar/packages/list/main.css'];


      this.scripts = ['/saito/lib/fullcalendar/packages/core/main.js',
		      '/saito/lib/fullcalendar/packages/daygrid/main.js', 
		      '/saito/lib/fullcalendar/packages/list/main.js'];
      this.attachStyleSheets();
      this.attachScripts();

      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }
  } 
    
  respondTo(type) {
/*****
    //
    // standalone large in DEV
    //
    if (type == 'email-appspace' || type == 'large-calendar') {
      let obj = {};
	  obj.render = this.renderLargeCalendar;
	  obj.attachEvents = this.attachEventsLargeCalendar;
	  obj.script = `
		<link href='/saito/lib/fullcalendar/packages/core/main.css' rel='stylesheet' />
		<link href='/saito/lib/fullcalendar/packages/daygrid/main.css' rel='stylesheet' />
		<link href='/saito/lib/fullcalendar/packages/list/main.css' rel='stylesheet' />
		<script src='/saito/lib/fullcalendar/packages/core/main.js'></script>
		<script src='/saito/lib/fullcalendar/packages/daygrid/main.js'></script>
		<script src='/saito/lib/fullcalendar/packages/list/main.js'></script>
	  `;
      return obj;
    }
    //
    // tiny calendar
    //
    if (type == 'tiny-calendar') {
      let obj = {};
	  obj.render = this.renderTinyCalendar;
	  obj.attachEvents = this.attachEventsTinyCalendar;
	  obj.script = `
		<link href='/saito/lib/fullcalendar/packages/core/main.css' rel='stylesheet' />
		<link href='/saito/lib/fullcalendar/packages/daygrid/main.css' rel='stylesheet' />
		<link href='/saito/lib/fullcalendar/packages/list/main.css' rel='stylesheet' />
		<script src='/saito/lib/fullcalendar/packages/core/main.js'></script>
		<script src='/saito/lib/fullcalendar/packages/daygrid/main.js'></script>
		<script src='/saito/lib/fullcalendar/packages/list/main.js'></script>
	  `;
      return obj;
    }
****/
    return null;
  }


  onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let calendar = app.modules.returnModule("Calendar");

    if (conf == 0) {

      let publickey = app.wallet.returnPublicKey();

      //
      // save our events
      //
      if (tx.isTo(publickey)) {

	let includes_tx = 0;
        for (let i = 0; i < this.appointments.length; i++) {
	  if (this.appointments[i].transaction.sig === tx.transaction.sig) {
	    includes_tx = 1;
	  }
	}
	if (includes_tx == 0) {
	  this.appointments.push(tx);
	}

console.log("ADDING APPOINTMENT: " + JSON.stringify(this.appointments));

        app.storage.saveTransaction(tx);

	//
	// re-render calendar if possible
	//
	//try {
	//  data = {};
	//  data.calendar = this;
	//  this.renderEmail(app, data);
	//  this.attachEventsEmail(app, data);
	//} catch (err) {
	//}

      }
    }
  }


  addEvent(event_type="event", event_start=null, event_end=null, title, text) {

    //
    // transaction to end-user, containing msg.request / msg.data is
    //
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(this.app.wallet.returnPublicKey());
    newtx.msg.module       	= "Calendar";
    newtx.msg.type       	= event_type;
    newtx.msg.event_start   = event_start;
    newtx.msg.event_end     = event_end;
    newtx.msg.event_title   = title;
    newtx.msg.event_text    = text;
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    this.appointments.push(newtx);
  }



  isCalendarActive() {
    try {
      if (document.getElementById("tiny-calendar")) { return 1; }
      if (document.getElementById("large-calendar")) { return 1; }
    } catch (err) {
    }
    return 0;
  }

  convertTransactionToEvent(tx) {

    let eventobj = {};
        eventobj.title = tx.msg.event_title;
        eventobj.start = tx.msg.event_start;
        eventobj.end   = tx.msg.event_end;
        eventobj.title = tx.msg.event_title;
        eventobj.backgroundColor = 'green',
        eventobj.borderColor = 'green'

    return eventobj;

  }


  //
  // load appointment transactions from archives
  //
  onPeerHandshakeComplete(app, peer) {

    if (this.isCalendarActive() == 0) { return; }

console.log("LOADING CALENDAR APPOINTMENTS!");

    //
    // load calendar appointments
    //
    this.app.storage.loadTransactions("Calendar", 50, (txs) => {
      for (let i = 0; i < txs.length; i++) {
        this.appointments.unshift(txs[i]);
      }
    });

  }

}

module.exports = Calendar;

