module.exports = (app) => {

    return `


            <div class="row col-mb-30">

                <div class="col-lg-4 col-6">
                    <label>Default:</label><br>
                    <input type="checkbox" class="bt-switch" checked>
                </div>

                <div class="col-lg-4 col-6">
                    <label>Disabled:</label><br>
                    <input class="bt-switch" type="checkbox" checked disabled>
                </div>

                <div class="col-lg-4 col-6">
                    <label>Readonly:</label><br>
                    <input class="bt-switch" type="checkbox" checked readonly>
                </div>

                <div class="w-100"></div>

                <div class="col-lg-4 col-6">
                    <label>Indeterminate:</label><br>
                    <input class="bt-switch" type="checkbox" checked data-indeterminate="true">
                </div>

                <div class="col-lg-4 col-6">
                    <label>Inverse:</label><br>
                    <input class="bt-switch" type="checkbox" checked data-inverse="true">
                </div>

                <div class="col-lg-4 col-6">
                    <label>Mini:</label><br>
                    <input class="bt-switch" type="checkbox" checked data-size="mini">
                </div>

                <div class="w-100 line"></div>

                <div class="col-12">
                    <label>On Color:</label><br>
                    <div class="row">
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-color="primary">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-color="info">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-color="success">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-color="warning">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-color="default">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-color="danger">
                        </div>
                        <div class="col-md-2 col-6" style="margin-top: 15px">
                            <input class="bt-switch" type="checkbox" checked data-on-color="themecolor">
                        </div>
                        <div class="col-md-2 col-6" style="margin-top: 15px">
                            <input class="bt-switch" type="checkbox" checked data-on-color="black">
                        </div>
                        <div class="col-md-2 col-6" style="margin-top: 15px">
                            <input class="bt-switch" type="checkbox" checked data-on-color="white">
                        </div>
                    </div>

                </div>

                <div class="w-100 line"></div>

                <div class="col-12">
                    <label>Off Color:</label><br>
                    <div class="row">
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" data-off-color="primary">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" data-off-color="info">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" data-off-color="success">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" data-off-color="warning">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" data-off-color="default">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" data-off-color="danger">
                        </div>
                        <div class="col-md-2 col-6" style="margin-top: 15px">
                            <input class="bt-switch" type="checkbox" data-off-color="themecolor">
                        </div>
                        <div class="col-md-2 col-6" style="margin-top: 15px">
                            <input class="bt-switch" type="checkbox" data-off-color="black">
                        </div>
                        <div class="col-md-2 col-6" style="margin-top: 15px">
                            <input class="bt-switch" type="checkbox" data-off-color="white">
                        </div>
                    </div>

                </div>

                <div class="w-100 line"></div>

                <div class="col-12">
                    <label>Custom Text:</label><br>
                    <div class="row">
                        <div class="col-lg-3">
                        <input class="bt-switch" type="checkbox" checked data-on-text="Yes" data-off-text="No" data-on-color="info" data-off-color="danger">
                        </div>
                        <div class="col-lg-3">
                            <input class="bt-switch" type="checkbox" checked data-on-text="Enable" data-off-text="Disable">
                        </div>
                        <div class="col-lg-3">
                            <input class="bt-switch" type="checkbox" checked data-on-text="Online" data-off-text="Offline" data-on-color="danger" data-off-color="default">
                        </div>
                        <div class="col-lg-3">
                            <input class="bt-switch" type="checkbox" checked data-on-text="abc" data-off-text="xyz" data-on-color="white" data-off-color="black">
                        </div>
                    </div>
                </div>

                <div class="w-100 line"></div>

                <div class="col-12">
                    <label>Custom Icons:</label><br>
                    <div class="row">
                        <div class="col-md-2 col-6">
                        <input class="bt-switch" type="checkbox" checked data-on-text="<i class='icon-thumbs-up'></i>" data-off-text="<i class='icon-thumbs-down'></i>">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-text="<i class='icon-smile'></i>" data-off-text="<i class='icon-frown'></i>" data-on-color="info" data-off-color="danger">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-text="<i class='icon-lock3'></i>" data-off-text="<i class='icon-unlock'></i>" data-on-color="default" data-off-color="danger">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-text="<i class='icon-line2-envelope-open'></i>" data-off-text="<i class='icon-line2-envelope'></i>" data-on-color="success" data-off-color="danger">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-text="<i class='icon-line-circle-check'></i>" data-off-text="<i class='icon-line-circle-cross'></i>" data-on-color="white" data-off-color="black">
                        </div>
                        <div class="col-md-2 col-6">
                            <input class="bt-switch" type="checkbox" checked data-on-text="<i class='icon-line-check'></i>" data-off-text="<i class='icon-line-cross'></i>"  data-on-color="black" data-off-color="white">
                        </div>
                    </div>
                </div>

                <div class="w-100 line"></div>

                <div class="col-12">
                    <label>Custom Width:</label><br>
                    <div class="row">
                        <div class="col-lg-4 col-6">
                            <input class="bt-switch" type="checkbox" data-on-text="20" checked data-handle-width="20">
                        </div>

                        <div class="col-lg-4 col-6">
                            <input class="bt-switch" type="checkbox" data-on-text="50" checked data-handle-width="50">
                        </div>

                        <div class="col-lg-4 col-6">
                            <input class="bt-switch" type="checkbox" data-on-text="100" checked data-handle-width="100">
                        </div>
                    </div>
                </div>

                <div class="w-100 line"></div>
            </div>

            <h3>Custom Toggles &amp; Switches</h3>

            <div class="row">
                <div class="col-lg-6">

                    <!-- SWITCH 1 - ROUND -->
                    <div class="switch">
                        <input id="switch-toggle-1" class="switch-toggle switch-rounded-mini switch-toggle-round" type="checkbox">
                        <label for="switch-toggle-1"></label>
                    </div>

                    <div class="switch">
                        <input id="switch-toggle-2" class="switch-toggle switch-toggle-round" type="checkbox">
                        <label for="switch-toggle-2"></label>
                    </div>

                    <div class="switch">
                        <input id="switch-toggle-3" class="switch-toggle switch-rounded-large switch-toggle-round" type="checkbox">
                        <label for="switch-toggle-3"></label>
                    </div>

                    <div class="switch">
                        <input id="switch-toggle-4" class="switch-toggle switch-rounded-xlarge switch-toggle-round" type="checkbox">
                        <label for="switch-toggle-4"></label>
                    </div>

                </div>

                <div class="col-lg-6">

                    <!-- SWITCH 2 - Flat -->
                    <div class="switch">
                        <input id="switch-toggle-5" class="switch-toggle switch-flat-mini switch-toggle-flat" type="checkbox">
                        <label for="switch-toggle-5"></label>
                    </div>

                    <div class="switch">
                        <input id="switch-toggle-6" class="switch-toggle switch-toggle-flat" type="checkbox">
                        <label for="switch-toggle-6"></label>
                    </div>

                    <div class="switch">
                        <input id="switch-toggle-7" class="switch-toggle switch-flat-large switch-toggle-flat" type="checkbox">
                        <label for="switch-toggle-7"></label>
                    </div>

                    <div class="switch">
                        <input id="switch-toggle-8" class="switch-toggle switch-flat-xlarge switch-toggle-flat" type="checkbox">
                        <label for="switch-toggle-8"></label>
                    </div>

                </div>

                <div class="w-100 clear"></div>

                <div class="w-100 line"></div>

                <div class="col-12">
                    <label>Switcher inside Modal:</label><br>
                    <!-- Button trigger modal -->
                    <button class="button button-3d button-large m-0" data-bs-toggle="modal" data-bs-target="#myModal">Launch Modal</button>

                    <!-- Modal -->
                    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-body center">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h4 class="modal-title" id="myModalLabel">Switcher inside Modal</h4>
                                        <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                                    </div>
                                    <div class="modal-body section bg-transparent m-0">
                                        <div class="row col-mb-50">
                                            <div class="col-sm-6">
                                                <input class="bt-switch" type="checkbox" checked data-on-text="Enable" data-off-text="Disable">
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="switch">
                                                    <input id="switch-toggle-12" class="switch-toggle switch-toggle-round center" type="checkbox">
                                                    <label for="switch-toggle-12"></label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-100 clear"></div>

                <div class="w-100 line"></div>
            </div>

            <form>
                <div class="row">
                    <div class="col-lg-6">
                        <h4>Radio Buttons</h4>
                        <div>
                            <input id="radio-4" class="radio-style" name="radio-group-1" type="radio" checked>
                            <label for="radio-4" class="radio-style-1-label">First Choice</label>
                        </div>
                        <div>
                            <input id="radio-5" class="radio-style" name="radio-group-1" type="radio">
                            <label for="radio-5" class="radio-style-1-label">Second Choice</label>
                        </div>
                        <div>
                            <input id="radio-6" class="radio-style" name="radio-group-1" type="radio">
                            <label for="radio-6" class="radio-style-1-label">Third Choice</label>
                        </div>

                        <div class="line"></div>

                        <div>
                            <input id="radio-7" class="radio-style" name="radio-group-2" type="radio" checked>
                            <label for="radio-7" class="radio-style-2-label">First Choice</label>
                        </div>
                        <div>
                            <input id="radio-8" class="radio-style"name="radio-group-2" type="radio">
                            <label for="radio-8" class="radio-style-2-label">Second Choice</label>
                        </div>
                        <div>
                            <input id="radio-9" class="radio-style" name="radio-group-2" type="radio">
                            <label for="radio-9" class="radio-style-2-label">Third Choice</label>
                        </div>

                        <div class="line"></div>

                        <div>
                            <input id="radio-10" class="radio-style" name="radio-group-3" type="radio" checked>
                            <label for="radio-10" class="radio-style-3-label">First Choice</label>
                        </div>
                        <div>
                            <input id="radio-11" class="radio-style"name="radio-group-3" type="radio">
                            <label for="radio-11" class="radio-style-3-label">Second Choice</label>
                        </div>
                        <div>
                            <input id="radio-12" class="radio-style" name="radio-group-3" type="radio">
                            <label for="radio-12" class="radio-style-3-label">Third Choice</label>
                        </div>

                        <div class="line"></div>

                        <h4>Small Size - Radio Buttons</h4>

                        <div>
                            <input id="radio-1" class="radio-style" name="radio-group" type="radio" checked>
                            <label for="radio-1" class="radio-style-1-label radio-small">First Choice</label>
                        </div>
                        <div>
                            <input id="radio-2" class="radio-style" name="radio-group" type="radio">
                            <label for="radio-2" class="radio-style-2-label radio-small">Second Choice</label>
                        </div>
                        <div>
                            <input id="radio-3" class="radio-style" name="radio-group" type="radio">
                            <label for="radio-3" class="radio-style-3-label radio-small">Third Choice</label>
                        </div>
                    </div>

                    <div class="col-lg-6">

                        <h4>Checkboxes</h4>

                        <div>
                            <input id="checkbox-4" class="checkbox-style" name="checkbox-4" type="checkbox" checked>
                            <label for="checkbox-4" class="checkbox-style-1-label">First Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-5" class="checkbox-style" name="checkbox-5" type="checkbox">
                            <label for="checkbox-5" class="checkbox-style-1-label">Second Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-6" class="checkbox-style" name="checkbox-6" type="checkbox">
                            <label for="checkbox-6" class="checkbox-style-1-label">Third Choice</label>
                        </div>

                        <div class="line"></div>

                        <div>
                            <input id="checkbox-7" class="checkbox-style" name="checkbox-7" type="checkbox" checked>
                            <label for="checkbox-7" class="checkbox-style-2-label">First Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-8" class="checkbox-style" name="checkbox-8" type="checkbox">
                            <label for="checkbox-8" class="checkbox-style-2-label">Second Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-9" class="checkbox-style" name="checkbox-9" type="checkbox">
                            <label for="checkbox-9" class="checkbox-style-2-label">Third Choice</label>
                        </div>

                        <div class="line"></div>

                        <div>
                            <input id="checkbox-10" class="checkbox-style" name="checkbox-10" type="checkbox" checked>
                            <label for="checkbox-10" class="checkbox-style-3-label">First Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-11" class="checkbox-style" name="checkbox-11" type="checkbox">
                            <label for="checkbox-11" class="checkbox-style-3-label">Second Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-12" class="checkbox-style" name="checkbox-12" type="checkbox">
                            <label for="checkbox-12" class="checkbox-style-3-label">Third Choice</label>
                        </div>

                        <div class="line"></div>

                        <h4>Small Size - CheckBoxes</h4>

                        <div>
                            <input id="checkbox-1" class="checkbox-style" name="checkbox-1" type="checkbox" checked>
                            <label for="checkbox-1" class="checkbox-style-1-label checkbox-small">First Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-2" class="checkbox-style" name="checkbox-2" type="checkbox">
                            <label for="checkbox-2" class="checkbox-style-2-label checkbox-small">Second Choice</label>
                        </div>
                        <div>
                            <input id="checkbox-3" class="checkbox-style" name="checkbox-3" type="checkbox">
                            <label for="checkbox-3" class="checkbox-style-3-label checkbox-small">Third Choice</label>
                        </div>
                    </div>
                </div>
            </form>

      
    `;
}