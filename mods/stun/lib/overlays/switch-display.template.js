const SwitchDisplayTemplate = (display_mode) => {
  let html =
    display_mode == "presentation"
      ? `  <div id="presentation" class="switch-to saito-modal-menu-option"><i class="${
          display_mode === "presentation" && "fa-solid fa-check"
        }"></i><div>Presentation</div></div>`
      : "";

  return `
      <div class="switch-display-container saito-modal">
     <div class="saito-modal-content">
    ${html}
      <div id="focus" class="switch-to saito-modal-menu-option"><i class="${
        display_mode === "focus" && "fa-solid fa-check"
      }"></i><div>Focus</div></div>
           <div id="gallery" class="switch-to saito-modal-menu-option"><i class="${
             display_mode === "gallery" && "fa-solid fa-check"
           }"></i><div>Gallery</div></div>
           <div id="speaker" class="switch-to saito-modal-menu-option"><i class="${
             display_mode === "speaker" && "fa-solid fa-check"
           }"></i><div>Speaker</div></div>
         </div>
    </div>
       `;
};

module.exports = SwitchDisplayTemplate;
