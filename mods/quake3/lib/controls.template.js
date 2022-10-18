
module.exports = (app, mod, ui) => {

  let html = `

    <div id="quake-controls" class="quake-controls">
    <table oncontextmenu="return false">
        <tr id="+attack">
            <td onclick="ui.setMyKeyDownListener('+attack')">Attack</td>
            <td> </td>
        <tr id="+zoom">
            <td onclick="ui.setMyKeyDownListener('+zoom')">Zoom</td>
            <td> </td>
            
        <tr class="blank_row">
            <td colspan="3"></td>
        </tr>

        <tr id="+forward">
            <td onclick="ui.setMyKeyDownListener('+forward')">Move Forward</td>
            <td> </td>
        <tr id="+back">
            <td onclick="ui.setMyKeyDownListener('+back')">Move Backward</td>
            <td> </td>
        <tr id="+moveleft">
            <td onclick="ui.setMyKeyDownListener('+moveleft')">Move Left</td>
            <td> </td>
        <tr id="+moveright">
            <td onclick="ui.setMyKeyDownListener('+moveright')">Move Right</td>
            <td> </td>
        <tr id="+moveup">
            <td onclick="ui.setMyKeyDownListener('+moveup')">Jump</td>
            <td> </td>
        <tr id="+speed">
            <td onclick="ui.setMyKeyDownListener('+speed')">Walk</td>
            <td> </td>
        <tr id="+movedown">
            <td onclick="ui.setMyKeyDownListener('+movedown')">Crouch</td>
            <td> </td>
                        
        <tr class="blank_row">
            <td colspan="3"></td>
        </tr>

        <tr id="weapnext">
            <td onclick="ui.setMyKeyDownListener('weapnext')">Next Weapon </td>
            <td> </td>
        <tr id="weapprev">
            <td onclick="ui.setMyKeyDownListener('weapprev')">Previous Weapon </td>
            <td> </td>
        <tr id="weapon 1">
            <td onclick="ui.setMyKeyDownListener('weapon 1')">Gauntlet (melee) </td>
            <td> </td>
        <tr id="weapon 2">
            <td onclick="ui.setMyKeyDownListener('weapon 2')">Machine Gun</td>
            <td> </td>
        <tr id="weapon 3">
            <td onclick="ui.setMyKeyDownListener('weapon 3')">Super Shotgun</td>
            <td> </td>
        <tr id="weapon 4">
            <td onclick="ui.setMyKeyDownListener('weapon 4')">Grenade Launcher</td>
            <td> </td>
        <tr id="weapon 5">
            <td onclick="ui.setMyKeyDownListener('weapon 5')">Rocket Launcher</td>
            <td> </td>
        <tr id="weapon 6">
            <td onclick="ui.setMyKeyDownListener('weapon 6')">Lightning Gun</td>
            <td> </td>
        <tr id="weapon 7">
            <td onclick="ui.setMyKeyDownListener('weapon 7')">Railgun</td>
            <td> </td>
        <tr id="weapon 8">
            <td onclick="ui.setMyKeyDownListener('weapon 8')">Plasma Gun</td>
            <td> </td>
        <tr id="weapon 9">
            <td onclick="ui.setMyKeyDownListener('weapon 9')">BFG</td>
            <td> </td>
                        
        <tr class="blank_row">
            <td colspan="3"></td>
        </tr>

        <tr id="messagemode">
            <td onclick="ui.setMyKeyDownListener('messagemode')">Game Chat</td>
            <td> </td>
        <tr id="messagemode2">
            <td onclick="ui.setMyKeyDownListener('messagemode2')">Team Chat</td>
            <td> </td>
        <tr id="+scores">
            <td onclick="ui.setMyKeyDownListener('+scores')">Scoreboard</td>
            <td> </td>
        <tr id="togglemenu">
            <td onclick="ui.setMyKeyDownListener('togglemenu')">Game Menu</td>
            <td> </td>
        <tr id="screenshot">
            <td onclick="ui.setMyKeyDownListener('screenshot')">Screenshot (in-game)</td>
            <td> </td>
        </tr>
    </table>
    </div>

  `;

  return html;

}

