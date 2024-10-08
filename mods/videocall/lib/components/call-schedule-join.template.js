module.exports  = (app, mod, events) => {
    let html = `
        <div class="call-schedule-join-container">
            <h4>Scheduled Calls</h4>
            <div class="scheduled-calls">`;
    
    for (let call of comp.keys){
        let startTime = new Date(call?.startTime);
        html += `<div class="call-schedule-card-container" data-id="${call.publicKey}">
                    <div class="call-schedule-card-item">Start Time: <span class="card-value">${startTime.toLocaleString()}</span></div>
                    <div class="call-schedule-card-item">Duration: <span class="card-value">${call?.duration || ""}</span></div>
                    <div class="call-schedule-card-item">Description: <span class="card-value">${call?.description || ""}</span></div>
                    <div class="call-schedule-card-item call-countdown" data-id="${call.publicKey}">Call starts in...</div>
                    <div class="call-schedule-buttons">
                        <button class="delete-call-button saito-button-secondary" data-id="${call.publicKey}">Delete</button>
                        <div class="enter-call-button saito-button-primary hidden" data-id="${call.publicKey}">${auto_join ? "Enter": "Copy Link"}</div>
                    </div>
                </div>`;
    }

    html += `</div>
            <h4>New Call</h4>
            <div class="enter-call-button saito-button-primary" id="create-new-room">Create</div>
        </div>
    `;

    return html;
}