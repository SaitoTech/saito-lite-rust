module.exports = (app, mod) => {

   return `
    <div class="scheduler-overlay-container">
      

      <div class="step"  id="first-step">

        <div class="overlay-content-container first-step">
          <div class="overlay-content">

            <div>Invite:</div> 
            <select class="saito-new-select" id="schedule-person">
              <option value="1">1 person</option>
              <option value="2">2 person</option>
              <option value="3">3 person</option>
              <option value="4">4 person</option>
              <option value="5">5 person</option>
              <option value="6">6 person</option>
            </select>

          </div>

          <div class="overlay-content-item scheduled-timestamp">
            <p>Set timezone</p>
          </div>
        </div>

        <div id="scheduler-overlay-next-btn" class="saito-button-secondary small scheduler-overlay-step-btn">
          Next <i class="fa fa-regular fa-arrow-right"></i>
        </div>
      </div>

    </div>
   `;

}

