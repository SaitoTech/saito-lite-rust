module.exports = () => {

	return `

	    <div id="tutorial07-main" class="saito-container-dep">

	      <h2>Click to Send a Message in a Transaction</h2>

	      <input type="text" id="tutorial07-text" value="Your message here"/>

	      <input type="button" class="tutorial07-button" value="Send Message" style="padding: 10px;"/>
	      <input type="button" class="tutorial07-button-clear" value="Clear" style="padding: 10px;"/>

	      <br />

	      <div class="tutorial07-received-transactions">
	      </div>

              <h2> Set Keyword Filters</h2>

              <input type="text" id="tutorial07-filter" />

              <input type="button" class="tutorial07-filter-button" value="Add to Filter" style="padding: 10px;"/>
	      <input type="button" class="tutorial07-filter-clear" value="Clear Filters" style="padding: 10px;"/>


              <ul id="tutorial07-filter-list">
              </ul>

      	    </div>
     
  	`;
};
