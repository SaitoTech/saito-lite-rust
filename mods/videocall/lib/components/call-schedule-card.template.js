module.exports = CallScheduleJoinTemplate = (app, mod,  callDetails) => {
    let {title, description, startTime, timeLeft} =callDetails;
    // <p class="call-schedule-card time-left">${timeLeft}</p>
    return `
        <div class="call-schedule-card-container" id="${callDetails.cardId}">
    <p class="call-schedule-card-item">Description: <span class="card-value">${description}</span></p>
    <p class="call-schedule-card-item">Start Time: <span class="card-value">${startTime.toLocaleString()}</span></p>

    <button class="enter-call-button" {{buttonDisabled}}>Enter Call</button>
        </div>
    `;
}

