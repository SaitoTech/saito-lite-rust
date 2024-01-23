module.exports = (app, mod, options) => {
	let html = `

     <div class="saito-modal saito-scheduler" id="saito-scheduler">

       <div class="saito-modal-title">Schedule Invite:</div>

       <div class="saito-modal-content">

         <input type="datetime-local" value="" id="schedule-datetime-input" name="schedule-datetime" class="scheduler-datetime-input" style="padding:2rem;height:5rem;margin-top:2rem; font-size: 2.8rem" />

         <div id="saito-scheduler-button" class="saito-button-secondary small saito-scheduler-button" style="background-color: white; font-size: 3rem;margin-right:0px">next</div>

       </div>
     </div>
    `;

	return html;
};
