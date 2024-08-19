
module.exports = CallScheduleWizardTemplate = (app, mod) => {

    return `
    <div class="call-schedule-container">
                <h4>Schedule a Call</h4>
                <form id="scheduleForm">
                    <label for="startTime">Start Time:</label>
                    <input type="datetime-local" id="startTime" required>         
                    <label for="duration">Duration:</label>
                    <select class="saito-select" id="duration" required>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                    </select>
                    
                    <label for="description">Description:</label>
                    <textarea id="description" rows="4" required></textarea>
                    
                    <button type="submit">Create Link</button>
                </form>
            <div>
    `
}