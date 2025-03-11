module.exports  = (app, mod, this_self) => {
	return `

			<div id="saito-backup-overylay" class="saito-overlay-form saito-backup-container saito-overlay-backup-reminder">
		      <div class="saito-overlay-form-header">
		        <div class="saito-overlay-form-header-title">${this_self.title}</div>
		      </div>
		      <div class="saito-overlay-form-text">
		      	${this_self.msg}
		      </div>
	              
	            <div class="saito-overlay-form-submitline saito-backup-options">
					<div class="saito-overlay-form-alt-opt saito-backup-manual" id="saito-backup-manual">no. backup manually</div>	    			
	    			<div class="saito-button-primary saito-overlay-form-alt-opt saito-backup-auto" id="saito-backup-auto">yes, make it easy</div>
	    		</div>
	      </div>
			`;
};
