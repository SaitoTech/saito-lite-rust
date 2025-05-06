module.exports = (app, mod, chat_group) => {
  let html = `
   <div class="saito-modal saito-modal-menu" id="saito-chat-menu">
    <div class="saito-modal-title">${chat_group.name}</div>
     <div class="saito-modal-content">`;

  if (chat_group.id !== mod.communityGroup.id) {
    html += `<div id="rename" class="saito-modal-menu-option"><i class="fa-regular fa-id-card"></i><div>Rename</div></div>`;
  }

  if (chat_group?.muted) {
    html += `<div id="unmute" class="saito-modal-menu-option"><i class="fa-solid fa-volume-high"></i><div>Unmute</div></div>`;
  } else {
    html += `<div id="mute" class="saito-modal-menu-option"><i class="fa-solid fa-volume-xmark"></i><div>Mute</div></div>`;
  }
  html += `<div id="delete" class="saito-modal-menu-option"><i class="fas fa-trash-alt"></i><div>Remove</div></div>
      `;

  if (chat_group.id !== mod.communityGroup.id) {
    if (chat_group?.member_ids || chat_group.members.length > 2) {
      html += `<div id="leave" class="saito-modal-menu-option"><i class="fa-solid fa-door-open"></i><div>Leave Group</div></div>`;
    } else {
      let other_party = '';
      for (let mem of chat_group.members) {
        if (mem !== mod.publicKey) {
          other_party = mem;
        }
      }

      if (mod.black_list.includes(other_party)) {
        html += `<div id="unblock" class="saito-modal-menu-option" data-id="${other_party}"><i class="fa-regular fa-circle-check"></i><div>Unblock</div></div>`;
      } else {
        html += `<div id="block" class="saito-modal-menu-option"><i class="fas fa-ban"></i><div>Block</div></div>`;
      }
    }
  }

  if (chat_group?.member_ids) {
    html += `<div id="invite" class="saito-modal-menu-option"><i class="fas fa-link"></i><div>Invite member</div></div>`;

    if (chat_group.member_ids[mod.publicKey] == 'admin') {
      html += `<div id="admin" class="saito-modal-menu-option"><i class="fa-solid fa-key"></i><div>Promote Admin</div></div>`;
      html += `<div id="remove" class="saito-modal-menu-option"><i class="fa-solid fa-user-minus"></i><div>Remove member</div></div>`;
    }

    html += `<div id="view" class="saito-modal-menu-option"><i class="fa-solid fa-users"></i><div>View members</div></div>`;
  } else {
    //Or we can query the community group for recently active keys
    if (chat_group.id == mod.communityGroup.id || chat_group.members.length > 2) {
      html += `<div id="view" class="saito-modal-menu-option"><i class="fa-solid fa-users"></i><div>View members</div></div>`;
    }
  }

  html += `<div id="debug" class="saito-modal-menu-option"><i class="fa-solid fa-question"></i><div>Debug</div></div>`;

  html += '</div></div>';

  return html;
};
