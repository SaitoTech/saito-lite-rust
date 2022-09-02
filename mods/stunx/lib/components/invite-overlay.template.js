module.exports = (roomCode) => {
    return `
    <div class="stunx-invite-overlay" style="background-color: white; padding: 2rem 3rem; border-radius: 8px; ">
       <p class="stunx-invite-overlay-heading" style= margin-bottom:2rem;"> Room Details</p>
       <div class="stunx-invite-overlay-content" style=""> 
       <i class="fas fa-key"></i><p style="margin-right: .5rem;  color: var(--saito-primary); cursor: pointer" id="copyVideoInviteCode">  Room Code </p>  
       <i class="fas fa-link"></i>  <p style="margin-right: .5rem;  color: var(--saito-primary); cursor: pointer" id="copyVideoInviteLink">  Room Link </p>  
       </div>
       
    </div>
    `
}

// ${window.location.host}/stunx?invite_code=${roomCode}