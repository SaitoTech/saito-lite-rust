module.exports = CallScheduleLaunchTemplate = (app, callDetails) => {
    const { startTime, duration, description } = callDetails;
    

    const formattedStartTime = typeof startTime === 'string' ? startTime : new Date(startTime).toLocaleString();
    
    return `
    <div class="call-schedule-launch">
        <div class="call-schedule-launch-container">
            <h4>Scheduled Call Details</h4>
            <div class="call-details">
                <p><strong>Start Time:</strong> ${formattedStartTime}</p>
                <p><strong>Duration:</strong> ${duration}</p>
                <p><strong>Description:</strong> ${description}</p>
            </div>
            <button class="enter-call-button">Enter Call</button>
        </div>
    </div>
    `;
}