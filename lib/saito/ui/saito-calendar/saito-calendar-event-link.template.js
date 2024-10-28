module.exports  = (app, event) => {

    const formattedStartTime = new Date(event.startTime).toLocaleString();
    
    let html = `
    <div class="call-schedule-launch-main-container">
     <div class="saito-header-logo-wrapper" id="redsquare-link">
            <img class="saito-header-logo" alt="Logo" src="/saito/img/logo.svg" />
        </div>
        <div class="call-schedule-launch">
            <div class="call-schedule-launch-container">
                <h4>${event.identifier}</h4>
                <div class="call-details">
                    <p><strong>Start Time:</strong> ${formattedStartTime}</p>
                    <p><strong>Duration:</strong> ${event.duration}</p>
                    <p><strong>Description:</strong> ${event.description}</p>
                    <div class="time-to-call"></div>
                </div>
                `;

    if (new Date(event.startTime).getTime() > Date.now() + 5*60*1000) {
        html += `<div id="add-to-calendar" class="saito-button-primary">Add Reminder</div>`
    } else {
        html += `<div id="enter-call-button" class="saito-button-primary">Join</div>`
    }

    html +=  `</div>
        </div>
    <div>
    `;

    return html;
}