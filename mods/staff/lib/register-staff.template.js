module.exports = RegisterStaffTemplate = () => {
    return `
<div class="grid-2" style="width: 700px;margin: 10vh auto;">
        <div id="list_of_keys">
            Public Key:
        </div>
        <div id="publicKey"></div>

        <div>Key is registered</div>
        <div>
            <input id="isRegistered" type="checkbox" value="false" />
        </div>

        <div></div>
        <button id="add_staff">register</button>
        <button id="remove_staff">deregister</button>
    </div>
  `;
}
