module.exports = (app, mod, listeners) => {

  let listenersHtml = "";

  if (listeners) {
    listenersHtml = listeners.map(listener => ` <li class="list-group-item">${listener}</li>`).join('');
    console.log(listeners, listenersHtml);
  } else {
    listenersHtml = "<p> There are no listeners";
  }

  return ` <div class="appear listeners-container">
   
    <ul id="stun-listeners" class="list-group">
        ${listenersHtml}
    </ul>
    </div>`;
}