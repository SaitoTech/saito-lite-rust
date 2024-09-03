module.exports = CallScheduleJoinTemplate = (app, mod,  callDetails) => {
    let {title, description, startTime, timeLeft, duration} =callDetails;
    // <p class="call-schedule-card time-left">${timeLeft}</p>
    return `
        <div class="call-schedule-card-container" id="${callDetails.cardId}">
        <p class="call-schedule-card-item">Start Time: <span class="card-value">${startTime.toLocaleString()}</span></p>
        <p class="call-schedule-card-item">Duration: <span class="card-value">${duration}</span></p>
    <p class="call-schedule-card-item">Description: <span class="card-value">${description}</span></p>

    <div class="enter-call-button">Enter Call</div>
        </div>
    `;
}

