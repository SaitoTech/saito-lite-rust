module.exports  = (comp, auto_join) => {
    let html = `
        <div class="call-schedule-join-container">
            <h4>Scheduled Calls</h4>
            <div class="scheduled-calls">`;
    
    for (let call of comp.keys){
        let startTime = new Date(call?.startTime);
        let participants = call?.profile?.participants || [];

        let description = call?.description || "";
        if (description){
            description += "\n\n";
        }

        if (participants){
            description += "with: ";
            participants.forEach(key=> {
                if (key !== comp.mod.publicKey){
                    description += comp.app.keychain.returnUsername(key) + ", ";    
                }
            });
            description = description.slice(0, -2);
        }

        let mainBtn = "Enter";
        if (call?.profile?.participants?.includes(comp.mod.publicKey)){
            mainBtn = "Rejoin";
        }
        if (!auto_join){
            mainBtn = "Copy Link";
        }

        html += `<div class="call-schedule-card-container" data-id="${call.publicKey}">
                    <div class="call-schedule-card-item">Start Time: <span class="card-value">${startTime.toLocaleString()}</span></div>
                    <div class="call-schedule-card-item">Duration: <span class="card-value">${call?.duration || ""}</span></div>
                    <div class="call-schedule-card-item">Description: <span class="card-value">${description}</span></div>
                    <div class="call-schedule-card-item call-countdown" data-id="${call.publicKey}">Call starts in...</div>
                    <div class="call-schedule-buttons">
                        <button class="delete-call-button saito-button-secondary" data-id="${call.publicKey}">Delete</button>
                        <div class="enter-call-button saito-button-primary hidden" data-id="${call.publicKey}">${mainBtn}</div>
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