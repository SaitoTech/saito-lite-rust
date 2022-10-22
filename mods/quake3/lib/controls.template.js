module.exports = (app, mod, ui) => {

  let html = `

    <div id="quake-controls" class="quake-controls">
    <table oncontextmenu="return false">
        <tr id="+attack">
            <td class="quake-control-trigger" data-id="+attack">Attack</td>
            <td> </td>
        <tr id="+zoom">
            <td class="quake-control-trigger" data-id="+zoom">Zoom</td>
            <td> </td>
            
        <tr class="blank_row">
            <td colspan="3"></td>
        </tr>

        <tr id="+forward">
            <td class="quake-control-trigger" data-id="+forward">Move Forward</td>
            <td> </td>
        <tr id="+back">
            <td class="quake-control-trigger" data-id="+back">Move Backward</td>
            <td> </td>
        <tr id="+moveleft">
            <td class="quake-control-trigger" data-id="+moveleft">Move Left</td>
            <td> </td>
        <tr id="+moveright">
            <td class="quake-control-trigger" data-id="+moveright">Move Right</td>
            <td> </td>
        <tr id="+moveup">
            <td class="quake-control-trigger" data-id="+moveup">Jump</td>
            <td> </td>
        <tr id="+speed">
            <td class="quake-control-trigger" data-id="+speed">Walk</td>
            <td> </td>
        <tr id="+movedown">
            <td class="quake-control-trigger" data-id="+movedown">Crouch</td>
            <td> </td>
                        
        <tr class="blank_row">
            <td colspan="3"></td>
        </tr>

        <tr id="weapnext">
            <td class="quake-control-trigger" data-id="weapnext">Next Weapon </td>
            <td> </td>
        <tr id="weapprev">
            <td class="quake-control-trigger" data-id="weapprev">Previous Weapon </td>
            <td> </td>
        <tr id="weapon 1">
            <td class="quake-control-trigger" data-id="weapon 1">Gauntlet (melee) </td>
            <td> </td>
        <tr id="weapon 2">
            <td class="quake-control-trigger" data-id="weapon 2">Machine Gun</td>
            <td> </td>
        <tr id="weapon 3">
            <td class="quake-control-trigger" data-id="weapon 3">Super Shotgun</td>
            <td> </td>
        <tr id="weapon 4">
            <td class="quake-control-trigger" data-id="weapon 4">Grenade Launcher</td>
            <td> </td>
        <tr id="weapon 5">
            <td class="quake-control-trigger" data-id="weapon 5">Rocket Launcher</td>
            <td> </td>
        <tr id="weapon 6">
            <td class="quake-control-trigger" data-id="weapon 6">Lightning Gun</td>
            <td> </td>
        <tr id="weapon 7">
            <td class="quake-control-trigger" data-id="weapon 7">Railgun</td>
            <td> </td>
        <tr id="weapon 8">
            <td class="quake-control-trigger" data-id="weapon 8">Plasma Gun</td>
            <td> </td>
        <tr id="weapon 9">
            <td class="quake-control-trigger" data-id="weapon 9">BFG</td>
            <td> </td>
                        
        <tr class="blank_row">
            <td colspan="3"></td>
        </tr>

        <tr id="messagemode">
            <td class="quake-control-trigger" data-id="messagemode">Game Chat</td>
            <td> </td>
        <tr id="messagemode2">
            <td class="quake-control-trigger" data-id="messagemode2">Team Chat</td>
            <td> </td>
        <tr id="+scores">
            <td class="quake-control-trigger" data-id="+scores">Scoreboard</td>
            <td> </td>
        <tr id="togglemenu">
            <td class="quake-control-trigger" data-id="togglemenu">Game Menu</td>
            <td> </td>
        <tr id="screenshot">
            <td class="quake-control-trigger" data-id="tweet">Tweet (in-game)</td>
            <td> </td>
        </tr>
    </table>
    <button type="button" id="finish-controls-button">Finish</button>
    </div>


  `;

  return html;

}
