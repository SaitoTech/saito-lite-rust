module.exports = (roomCode) => {
    return `
    <div style="background-color: white; padding: 2rem 3rem; border-radius: 8px; display:flex; flex-direction: column; align-items: center; justify-content: center; align-items:center">
       <p style= margin-bottom:2rem;">  Invite Created </p>
       <div style="display: grid; align-item: center; grid-template-columns:max-content;"> 
       <p style="margin-right: .5rem;  color: var(--saito-primary); cursor: pointer" id="copyVideoInviteCode"> Copy Room Code </p> 
       <p style="margin-right: .5rem;  color: var(--saito-primary); cursor: pointer" id="copyVideoInviteLink"> Copy Room Link </p>  
       </div>
       
    </div>
    `
}

// ${window.location.host}/stunx?invite_code=${roomCode}