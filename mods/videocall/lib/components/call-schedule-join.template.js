module.exports = CallScheduleJoinTemplate = (app, callDetails) => {
    const { startTime, duration, description } = callDetails;

    
    return `
        <div class="call-schedule-join-container">
            <h4>Scheduled Calls</h4>
            <div class="scheduled-calls">
            
            </div>
        </div>
    `;
}