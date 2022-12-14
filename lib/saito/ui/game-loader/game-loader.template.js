module.exports = (game_id, message, btn_name) => {

    let html =  `<div id="game-loader-container" class="game-loader-container"> 
                    <div id="game-loader-title" class="game-loader-title">${message}</div>`;
    if (game_id){
        html += `<button class="start-btn" id="start_btn" data-sig="${game_id}">${btn_name}</button>`;
    }else{
        html += `<div class="game-loader-spinner" id="game-loader-spinner"></div>`;    
    }
    html += `</div>`;

    return html;
}