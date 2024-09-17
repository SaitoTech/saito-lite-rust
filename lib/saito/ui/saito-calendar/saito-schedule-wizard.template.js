
module.exports = ScheduleWizardTemplate = (app, mod, wizard) => {

    let localDateTime;
    if (wizard.defaultDate){
        localDateTime = `${wizard.defaultDate.year}-${String(wizard.defaultDate.month).padStart(2, '0')}-${String(wizard.defaultDate.day).padStart(2, '0')}T12:00`;
    }else{
        const now = new Date();
        localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
    }

    let html = `
    <div class="call-schedule-wizard-container">
                <h4>Schedule a ${wizard.name}</h4>
                <form id="scheduleForm">
                    <label for="startTime">Start Time:</label>
                    <input type="datetime-local" id="startTime" min="${localDateTime}" value="${localDateTime}" required>         
                    <label for="duration">Duration:</label>
                    <select class="saito-select" id="duration" required>
                        <option value="15 minutes">15 minutes</option>
                        <option value="30 minutes">30 minutes</option>
                        <option value="45 minutes">45 minutes</option>
                        <option value="60 minutes">1 hour</option>
                    </select>`;
    if (!wizard?.title){
        html += ` <label for="title">Title</label>
                  <input type="text" name="title" id="title" placeholder="${mod.name}" value="${mod.name}"></input>`;
    }   

    if (!wizard?.description){
        html += `   <label for="description">Description:</label>
                    <textarea id="description" rows="4"></textarea>`;
    } 
                    
        html += `<button type="submit">Go</button>
                </form>
            <div>`;

    return html;
}

