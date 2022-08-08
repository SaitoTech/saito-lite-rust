module.exports = (roomCode) => {
    return `
    <div style="background-color: white; padding: 2rem 3rem; border-radius: 8px; display:flex; flex-direction: column; align-items: center; justify-content: center; align-items:center">
       <p style= margin-bottom:2rem;">  Invite Created </p>
       <div style="display: grid; align-item: center; grid-template-columns:max-content 1fr;"> 
       <p style="margin-right: .5rem;  color: var(--saito-primary)"> ${roomCode} </p>   <div style="margin-right: .5rem" id="copyVideoInviteCode"> <i class="fa fa-copy"> </i> </div> 
       <p style="margin-right: .5rem;  color: var(--saito-primary);"> ${window.location.host}/stunx?invite_code=${roomCode} </p>  <div style="margin-right: .5rem" id="copyVideoInviteLink"> <i class="fa fa-copy"> </i> </div>
       </div>
       
    </div>
    `
}