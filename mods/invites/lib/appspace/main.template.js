module.exports = InvitesAppspaceTemplate = (app, mod) => {

  return `
  
  <h3>Invitations:</h3> 

  <p></p>

  <div class="invites-appspace">

<div class="saito-list">
    <div class="invites-appspace-event">

  <div class="" style="width:100%;border: 1px solid grey;padding:1rem"> 

    <div style="float:right">August 31 2022, 4:31 PM</div><h6>Twilight Struggle - League Match</h6>
    

      <div class="saito-userbox">
        <div class="saito-list-user-content-box">
  <div class="saito-list-user-image-box">
    <img class="saito-identicon" src="/saito/img/background.png">
  </div>
          <div class="saito-username">david@saito</div>
  	  <p>status: ACCEPTED</p>
        </div>
      </div>

<div class="saito-userbox">
        <div class="saito-list-user-content-box">
  <div class="saito-list-user-image-box">
    <img class="saito-identicon" src="/saito/img/background.png">
  </div>
          <div class="saito-username">richard@saito</div>
          <p>status: PENDING</p>
        </div>
      </div>
    
      <div class="invites-button-accept saito-button-secondary">Accept</div>
      <div class="invites-button-modify saito-button-secondary">Modify</div>
      <div class="invites-button-cancel saito-button-secondary">Cancel</div>

  </div>
    </div>

  <div class="invites-json-tree" id="invites-json-tree"><ul class="jsontree_tree clearfix"><li class="jsontree_node jsontree_node_complex jsontree_node_expanded jsontree_node_empty">                        <div class="jsontree_value-wrapper">                            <div class="jsontree_value jsontree_value_array">                                <b>[</b>                                <span class="jsontree_show-more">…</span>                                <ul class="jsontree_child-nodes"></ul>                                <b>]</b></div></div></li></ul></div>

  <p></p>

  <div class="invites" id="invites"></div>

  <p></p>

  <h3>Create New Invitation</h3>

  <input type="text" class="invite_address" id="invite_address">

  <p></p>

  <div class="saito-button-primary invite_btn" id="invite_btn">Send Invite</div>

  </div>

  `;

}
