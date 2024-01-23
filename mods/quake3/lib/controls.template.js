module.exports = (app, mod, ui) => {
	let html = `

    <div id="quake-controls" class="quake-controls">

    <div id="screen-cover"">
        <div id="cover-content">
          <center>Press button for:</center>
          <center id="cover-indicator"></center>
        </div>
    </div>

    <div id="table-div">
    <table oncontextmenu="return false">

        <tr id="+attack" class="quake-control-trigger">
            <td>Attack</td>
            <td> </td>
        <tr id="+zoom" class="quake-control-trigger">
            <td>Zoom</td>
            <td> </td>
        <tr id="+forward" class="quake-control-trigger">
            <td>Move Forward</td>
            <td> </td>
        <tr id="+back" class="quake-control-trigger">
            <td>Move Backward</td>
            <td> </td>
        <tr id="+moveleft" class="quake-control-trigger">
            <td>Move Left</td>
            <td> </td>
        <tr id="+moveright" class="quake-control-trigger">
            <td>Move Right</td>
            <td> </td>
        <tr id="+moveup" class="quake-control-trigger">
            <td>Jump</td>
            <td> </td>
        <tr id="+speed" class="quake-control-trigger">
            <td>Walk</td>
            <td> </td>
        <tr id="+movedown" class="quake-control-trigger">
            <td>Crouch</td>
            <td> </td>
        <tr id="weapnext" class="quake-control-trigger">
            <td>Next Weapon </td>
            <td> </td>
        <tr id="weapprev" class="quake-control-trigger">
            <td>Previous Weapon </td>
            <td> </td>
        <tr id="weapon 1" class="quake-control-trigger">
            <td>Gauntlet (melee) </td>
            <td> </td>
        <tr id="weapon 2" class="quake-control-trigger">
            <td>Machine Gun</td>
            <td> </td>
        <tr id="weapon 3" class="quake-control-trigger">
            <td>Super Shotgun</td>
            <td> </td>
        <tr id="weapon 4" class="quake-control-trigger">
            <td>Grenade Launcher</td>
            <td> </td>
        <tr id="weapon 5" class="quake-control-trigger">
            <td>Rocket Launcher</td>
            <td> </td>
        <tr id="weapon 6" class="quake-control-trigger">
            <td>Lightning Gun</td>
            <td> </td>
        <tr id="weapon 7" class="quake-control-trigger">
            <td>Railgun</td>
            <td> </td>
        <tr id="weapon 8" class="quake-control-trigger">
            <td>Plasma Gun</td>
            <td> </td>
        <tr id="weapon 9" class="quake-control-trigger">
            <td>BFG</td>
            <td> </td>
        <tr id="messagemode" class="quake-control-trigger">
            <td>Game Chat</td>
            <td> </td>
        <tr id="messagemode2" class="quake-control-trigger">
            <td>Team Chat</td>
            <td> </td>
        <tr id="+scores" class="quake-control-trigger">
            <td>Scoreboard</td>
            <td> </td>
        <tr id="togglemenu" class="quake-control-trigger">
            <td>Game Menu</td>
            <td> </td>
        <tr id="screenshot" class="quake-control-trigger">
            <td>Tweet (in-game)</td>
            <td> </td>
        </tr>
    </table>
    </div>
    <div id="controls-bottom">
    
      <label for="sensitivity">Mouse sensitivity</label>
      <input type="field" class="sensitivity" id="sensitivity_indicator" value="5">
      <input type="range" id="sensitivity" class="sensitivity" min="0" max="10" step="0.01">
  
      <br>
      
      <label for="cg_fov">Field of View</label>
      <input type="field" class="cg_fov" id="fov_indicator" value="90">
      <input type="range" id="cg_fov" class="cg_fov" min="10" max="200" value="90">
  
      <div>
        <button type="button" id="finish-controls-button">Finish</button>
        <button type="button" id="default-controls-button">Restore Defaults</button>
      </div>
    </div>
  </div>
  `;

	return html;
};
