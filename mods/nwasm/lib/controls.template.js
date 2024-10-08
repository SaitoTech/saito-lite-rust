module.exports  = (app, mod) => {
	return `

    <div  style="" class="modal fade" id="buttonsModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Remap Buttons</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="modalMain" style="padding-bottom: 0;">
                    <table class="table" rv-hide="data.remapWait">
                        <thead>
                            <tr>
                                <th scope="col">Button</th>
                                <th scope="col">Keyboard</th>
                                <th scope="col">Joypad</th>
                                <th scope="col">Remap</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">D-Up</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Up" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Up" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(1)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(1)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">D-Down</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Down" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Down" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(2)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(2)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">D-Left</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Left" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Left" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(3)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(3)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">D-Right</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Right" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Right" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(4)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(4)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">A</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_A" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Action_A" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(5)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(5)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">B</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_B" type="text" class="form-control"
                                        disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Action_B" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(6)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(6)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Start</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_Start" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Action_Start" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(8)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(8)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Z</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_Z" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Action_Z" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(10)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(10)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">L</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_L" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Action_L" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(11)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(11)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">R</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_R" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Action_R" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(12)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(12)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Menu</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Menu" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <input rv-value="data.remappings.Joy_Mapping_Menu" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(9)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapJoy(9)"
                                                    class="btn btn-primary ml-2">Joypad</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">CUP</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_CUP" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(13)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">CDOWN</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_CDOWN" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(14)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">CLEFT</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_CLEFT" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(15)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">CRIGHT</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_CRIGHT" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(16)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">UP</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_Analog_Up" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(17)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">DOWN</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_Analog_Down" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(18)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">LEFT</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_Analog_Left" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(19)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">RIGHT</th>
                                <td>
                                    <input rv-value="data.remappings.Mapping_Action_Analog_Right" type="text"
                                        class="form-control" disabled>
                                </td>
                                <td>
                                    
                                </td>
                                <td>
                                    <table class="regularTable">
                                        <tr>
                                            <td>
                                                <button type="button" onclick="myApp.btnRemapKey(20)"
                                                    class="btn btn-primary">Key</button>
                                            </td>
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div rv-if="data.remapWait">
                        <div class="mt-4 mb-4 text-center">
                            Please press a { data.remapMode }
                            <br>
                            <br>
                            { data.inputController.Key_Last }
                            <br>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding-top: 0;" rv-hide="data.remapWait">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" onclick="myApp.restoreDefaultKeymappings()" class="btn btn-primary">Restore Defaults</button>
                    <button type="button" class="btn btn-primary" onclick="myApp.saveRemap()">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <script src="input_controller.js"></script>
  `;
};
