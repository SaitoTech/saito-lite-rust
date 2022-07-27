
module.exports = (app, mod) => {

   return `
    <div class="scheduler-overlay-container">
      

      <div class="step"  id="first-step">
        <div class="overlay-content-container first-step">
          <div class="overlay-content-item scheduled-item">
            <h5>Schedule Event</h5>
            <p>Create and event and share it with your contacts/friends</p>
          </div>

          <div class="overlay-content-item scheduled-icon">
            <!--<i class="fa fa-duetone fa-clipboard-list"></i>-->
          </div>
        </div>

        <div class="schedule-input-container">
          <div class="input-title">Event Name</div>
          <input type="text" name="event-name" id="event-name">
        </div>

        <div class="schedule-input-container">
          <div class="input-title">Event Type</div>

          <div class="event-type-container">
            <div class="event-type-input-container">
              <select class="saito-new-select" id="schedule-type">
                <option value="game">Game</option>
                <option value="game">League</option>
              </select>
            </div>
            <div class="event-type-input-container">
              <select class="saito-new-select" id="schedule-event-type">
                <option value="poker">Poker</option>
                <option value="chess">Chess</option>
                <option value="settler">Settler</option>
              </select>
            </div>
          </div>
        </div>

        <div class="schedule-input-container">
          <div class="input-title">Event Datetime</div>
          <div class="event-type-container datetime">
            <div class="event-type-input-container">
              <input type="datetime-local" id="schedule-datetime-input" name="schedule-datetime" class="scheduler-datetime-input">
            </div>
            <div class="event-type-input-container">
              <select class="saito-new-select" id="schedule-datetime-timezone">
                <option data-time-zone-id="1" data-gmt-adjustment="GMT-12:00" data-use-daylight="0" value="-12">(GMT-12:00)</option>
                <option data-time-zone-id="2" data-gmt-adjustment="GMT-11:00" data-use-daylight="0" value="-11">(GMT-11:00)</option>
                <option data-time-zone-id="3" data-gmt-adjustment="GMT-10:00" data-use-daylight="0" value="-10">(GMT-10:00)</option>
                <option data-time-zone-id="4" data-gmt-adjustment="GMT-09:00" data-use-daylight="1" value="-9">(GMT-09:00)</option>
                <option data-time-zone-id="5" data-gmt-adjustment="GMT-08:00" data-use-daylight="1" value="-8">(GMT-08:00)</option>
                <option data-time-zone-id="6" data-gmt-adjustment="GMT-08:00" data-use-daylight="1" value="-8">(GMT-08:00)</option>
                <option data-time-zone-id="7" data-gmt-adjustment="GMT-07:00" data-use-daylight="0" value="-7">(GMT-07:00)</option>
                <option data-time-zone-id="8" data-gmt-adjustment="GMT-07:00" data-use-daylight="1" value="-7">(GMT-07:00</option>

                <option data-time-zone-id="9" data-gmt-adjustment="GMT-07:00" data-use-daylight="1" value="-7">(GMT-07:00</option>
                <option data-time-zone-id="10" data-gmt-adjustment="GMT-06:00" data-use-daylight="0" value="-6">(GMT-06:00</option>
                           <option data-time-zone-id="11" data-gmt-adjustment="GMT-06:00" data-use-daylight="1" value="-6">(GMT-06:00</option>
                <option data-time-zone-id="12" data-gmt-adjustment="GMT-06:00" data-use-daylight="1" value="-6">(GMT-06:00</option>
                <option data-time-zone-id="13" data-gmt-adjustment="GMT-06:00" data-use-daylight="0" value="-6">(GMT-06:00</option>
                        <option data-time-zone-id="14" data-gmt-adjustment="GMT-05:00" data-use-daylight="0" value="-5">(GMT-05:00</option>
                <option data-time-zone-id="15" data-gmt-adjustment="GMT-05:00" data-use-daylight="1" value="-5">(GMT-05:00</option>
                <option data-time-zone-id="16" data-gmt-adjustment="GMT-05:00" data-use-daylight="1" value="-5">(GMT-05:00</option>
                          <option data-time-zone-id="17" data-gmt-adjustment="GMT-04:00" data-use-daylight="1" value="-4">(GMT-04:00</option>
                <option data-time-zone-id="18" data-gmt-adjustment="GMT-04:00" data-use-daylight="0" value="-4">(GMT-04:00</option>
                           <option data-time-zone-id="19" data-gmt-adjustment="GMT-04:00" data-use-daylight="0" value="-4">(GMT-04:00</option>
                  <option data-time-zone-id="20" data-gmt-adjustment="GMT-04:00" data-use-daylight="1" value="-4">(GMT-04:00</option>
                    <option data-time-zone-id="21" data-gmt-adjustment="GMT-03:30" data-use-daylight="1" value="-3.5">(GMT-03:30</option>
                        <option data-time-zone-id="22" data-gmt-adjustment="GMT-03:00" data-use-daylight="1" value="-3">(GMT-03:00</option>
                    <option data-time-zone-id="23" data-gmt-adjustment="GMT-03:00" data-use-daylight="0" value="-3">(GMT-03:00</option>
                <option data-time-zone-id="24" data-gmt-adjustment="GMT-03:00" data-use-daylight="1" value="-3">(GMT-03:00</option>
                     <option data-time-zone-id="25" data-gmt-adjustment="GMT-03:00" data-use-daylight="1" value="-3">(GMT-03:00</option>
                      <option data-time-zone-id="26" data-gmt-adjustment="GMT-02:00" data-use-daylight="1" value="-2">(GMT-02:00</option>
                        <option data-time-zone-id="27" data-gmt-adjustment="GMT-01:00" data-use-daylight="0" value="-1">(GMT-01:00</option>
                          <option data-time-zone-id="28" data-gmt-adjustment="GMT-01:00" data-use-daylight="1" value="-1">(GMT-01:00</option>
                  <option data-time-zone-id="29" data-gmt-adjustment="GMT+00:00" data-use-daylight="0" value="0">(GMT+00:00</option>
                <option data-time-zone-id="30" data-gmt-adjustment="GMT+00:00" data-use-daylight="1" value="0">(GMT+00:00</option>
                <option data-time-zone-id="31" data-gmt-adjustment="GMT+01:00" data-use-daylight="1" value="1">(GMT+01:00</option>
                <option data-time-zone-id="32" data-gmt-adjustment="GMT+01:00" data-use-daylight="1" value="1">(GMT+01:00</option>
                <option data-time-zone-id="33" data-gmt-adjustment="GMT+01:00" data-use-daylight="1" value="1">(GMT+01:00</option>
                <option data-time-zone-id="34" data-gmt-adjustment="GMT+01:00" data-use-daylight="1" value="1">(GMT+01:00</option>
                <option data-time-zone-id="35" data-gmt-adjustment="GMT+01:00" data-use-daylight="1" value="1">(GMT+01:00</option>
                               <option data-time-zone-id="36" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                 <option data-time-zone-id="37" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                <option data-time-zone-id="38" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                  <option data-time-zone-id="39" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                 <option data-time-zone-id="40" data-gmt-adjustment="GMT+02:00" data-use-daylight="0" value="2">(GMT+02:00</option>
                            <option data-time-zone-id="41" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                
                <option data-time-zone-id="42" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                     <option data-time-zone-id="43" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                 <option data-time-zone-id="44" data-gmt-adjustment="GMT+02:00" data-use-daylight="1" value="2">(GMT+02:00</option>
                    <option data-time-zone-id="45" data-gmt-adjustment="GMT+03:00" data-use-daylight="0" value="3">(GMT+03:00</option>
                <option data-time-zone-id="46" data-gmt-adjustment="GMT+03:00" data-use-daylight="1" value="3">(GMT+03:00</option>
                <option data-time-zone-id="47" data-gmt-adjustment="GMT+03:00" data-use-daylight="0" value="3">(GMT+03:00</option>
                   <option data-time-zone-id="48" data-gmt-adjustment="GMT+03:00" data-use-daylight="0" value="3">(GMT+03:00</option>
                   <option data-time-zone-id="49" data-gmt-adjustment="GMT+03:30" data-use-daylight="1" value="3.5">(GMT+03:30</option>
                  <option data-time-zone-id="50" data-gmt-adjustment="GMT+04:00" data-use-daylight="0" value="4">(GMT+04:00</option>
                             <option data-time-zone-id="51" data-gmt-adjustment="GMT+04:00" data-use-daylight="1" value="4">(GMT+04:00</option>
                             <option data-time-zone-id="52" data-gmt-adjustment="GMT+04:00" data-use-daylight="1" value="4">(GMT+04:00</option>
                   <option data-time-zone-id="53" data-gmt-adjustment="GMT+04:30" data-use-daylight="0" value="4.5">(GMT+04:30</option>
                 <option data-time-zone-id="54" data-gmt-adjustment="GMT+05:00" data-use-daylight="1" value="5">(GMT+05:00</option>
                         <option data-time-zone-id="55" data-gmt-adjustment="GMT+05:00" data-use-daylight="0" value="5">(GMT+05:00</option>
                         option>
                <option data-time-zone-id="56" data-gmt-adjustment="GMT+05:30" data-use-daylight="0" value="5.5">(GMT+05:30</option>
                               <option data-time-zone-id="57" data-gmt-adjustment="GMT+05:30" data-use-daylight="0" value="5.5">(GMT+05:30</option>
                <option data-time-zone-id="58" data-gmt-adjustment="GMT+05:45" data-use-daylight="0" value="5.75">(GMT+05:45</option>
                     <option data-time-zone-id="59" data-gmt-adjustment="GMT+06:00" data-use-daylight="1" value="6">(GMT+06:00</option>
                               <option data-time-zone-id="60" data-gmt-adjustment="GMT+06:00" data-use-daylight="0" value="6">(GMT+06:00</option>
                         <option data-time-zone-id="61" data-gmt-adjustment="GMT+06:30" data-use-daylight="0" value="6.5">(GMT+06:30</option>
                            <option data-time-zone-id="62" data-gmt-adjustment="GMT+07:00" data-use-daylight="0" value="7">(GMT+07:00</option>
                <option data-time-zone-id="63" data-gmt-adjustment="GMT+07:00" data-use-daylight="1" value="7">(GMT+07:00</option>
                       <option data-time-zone-id="64" data-gmt-adjustment="GMT+08:00" data-use-daylight="0" value="8">(GMT+08:00</option>
                <option data-time-zone-id="65" data-gmt-adjustment="GMT+08:00" data-use-daylight="0" value="8">(GMT+08:00</option>
                <option data-time-zone-id="66" data-gmt-adjustment="GMT+08:00" data-use-daylight="0" value="8">(GMT+08:00</option>
                <option data-time-zone-id="67" data-gmt-adjustment="GMT+08:00" data-use-daylight="0" value="8">(GMT+08:00</option>
                 <option data-time-zone-id="68" data-gmt-adjustment="GMT+08:00" data-use-daylight="0" value="8">(GMT+08:00</option>
                  <option data-time-zone-id="69" data-gmt-adjustment="GMT+09:00" data-use-daylight="0" value="9">(GMT+09:00</option>

                <option data-time-zone-id="70" data-gmt-adjustment="GMT+09:00" data-use-daylight="0" value="9">(GMT+09:00</option>
                 <option data-time-zone-id="71" data-gmt-adjustment="GMT+09:00" data-use-daylight="1" value="9">(GMT+09:00</option>
                   <option data-time-zone-id="72" data-gmt-adjustment="GMT+09:30" data-use-daylight="0" value="9.5">(GMT+09:30</option>
                    <option data-time-zone-id="73" data-gmt-adjustment="GMT+09:30" data-use-daylight="0" value="9.5">(GMT+09:30</option>
                  <option data-time-zone-id="74" data-gmt-adjustment="GMT+10:00" data-use-daylight="0" value="10">(GMT+10:00</option>
                    <option data-time-zone-id="75" data-gmt-adjustment="GMT+10:00" data-use-daylight="1" value="10">(GMT+10:00</option>
                <option data-time-zone-id="76" data-gmt-adjustment="GMT+10:00" data-use-daylight="1" value="10">(GMT+10:00</option>
                  <option data-time-zone-id="77" data-gmt-adjustment="GMT+10:00" data-use-daylight="0" value="10">(GMT+10:00</option>
                              <option data-time-zone-id="78" data-gmt-adjustment="GMT+10:00" data-use-daylight="1" value="10">(GMT+10:00</option>
                       <option data-time-zone-id="79" data-gmt-adjustment="GMT+11:00" data-use-daylight="1" value="11">(GMT+11:00</option>
                <option data-time-zone-id="80" data-gmt-adjustment="GMT+12:00" data-use-daylight="1" value="12">(GMT+12:00</option>
                                <option data-time-zone-id="81" data-gmt-adjustment="GMT+12:00" data-use-daylight="0" value="12">(GMT+12:00</option>
                <option data-time-zone-id="82" data-gmt-adjustment="GMT+13:00" data-use-daylight="0" value="13">(GMT+13:00</option>
                    </select>
            </div>
          </div>
        </div>

        <div class="scheduler-controls-container">
          <div id="scheduler-overlay-next-btn" class="saito-button-secondary small scheduler-overlay-control-btn">
            Cancel
          </div>
          <div id="scheduler-overlay-next-btn" class="saito-button-primary small scheduler-overlay-control-btn">
            Save Event
          </div>
        </div>
      </div>

    </div>
   `;

}

