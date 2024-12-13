module.exports  = (app, mod, keys) => {
  let html = `
      <div class="stun-appspace"> 
        <div class="stun-appspace-content">
            <div class="stunx-appspace-splash">
              <div class="stun-title">Saito Talk</div>
              <div>peer-to-peer video chat</div>
              <div class="stunx-splash-image"></div>
            </div>

          <div class="stunx-appspace-actions">`;


  let mode = null;
  if (mod.room_obj) {
    html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createRoom" data-id="${mod.room_obj?.call_id}">Join Meeting</div>`;
    mode = "join";
  } else if (keys.length > 0) {
      html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="joinScheduleRoom">Join / Start Meeting</div>`;
      mode = "select";
  }else{
      html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createRoom">Start Meeting</div>`;
      mode = "create";
      html += `<div class="stunx-precall-link" data-id="${mode}"><i class="fas fa-link"></i></div>`;
  }

  html += `</div>
        
          <div class="stun-appspace-footer">
            <div id="stunx-call-settings" class="stunx-call-settings"><i class="fa-solid fa-gears"></i><span>media settings</span></div>
            <div id="createScheduleRoom" class="stun-schedule-call"><i class="fas fa-calendar"></i><span>schedule call</span></div>
        </div>
      
      </div>

    `;

  return html;
};
