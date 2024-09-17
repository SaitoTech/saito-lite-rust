
module.exports = ScheduleWizardTemplate = (app, mod, name) => {

    const now = new Date();
    let localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');

    return `
    <div class="call-schedule-wizard-container">
                <h4>Schedule a ${name}</h4>
                <form id="scheduleForm">
                    <label for="startTime">Start Time:</label>
                    <input type="datetime-local" id="startTime" min="${localDateTime}" value="${localDateTime}" required>         
                    <label for="duration">Duration:</label>
                    <select class="saito-select" id="duration" required>
                        <option value="15 minutes">15 minutes</option>
                        <option value="30 minutes">30 minutes</option>
                        <option value="45 minutes">45 minutes</option>
                        <option value="60 minutes">1 hour</option>
                    </select>
                    
                    <label for="description">Description:</label>
                    <textarea id="description" rows="4" ></textarea>
                    
                    <button type="submit">Go</button>
                </form>
            <div>
    `
}