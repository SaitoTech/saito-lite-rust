module.exports = (message, btn_name = null) => {

    let html =  `<div id="game-loader-container" class="game-loader-container"> 
                    <div id="game-loader-title" class="game-loader-title">${message}</div>`;
    if (btn_name){
        html += `<button class="start-btn" id="start_btn">${btn_name}</button>`;
    }else{
        html += `<div class="game-loader-spinner" id="game-loader-spinner"></div>`;    
    }
    html += `</div>`;

    return html;
}