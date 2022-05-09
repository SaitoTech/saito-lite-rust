module.exports = (app) => {
    return `

    <h3>Modals</h3>

    <!-- Button trigger modal -->
    <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#myModal">Launch modal</button>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">Modal Heading</h4>
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div class="modal-body">
                    <h4>Text in a modal</h4>
                    <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>

                    <h4>Popover in a modal</h4>
                    <p>This <a href="#" role="button" class="btn btn-secondary" data-bs-toggle="popover" title="" data-bs-content="And here's some amazing content. It's very engaging. right?" data-original-title="A Title">button</a> should trigger a popover on click.</p>

                    <h4>Tooltips in a modal</h4>
                    <p><a href="#" data-bs-toggle="tooltip" title="" data-original-title="Tooltip">This link</a> and <a href="#" data-bs-toggle="tooltip" title="" data-original-title="Tooltip">that link</a> should have tooltips on hover.</p>
                    <hr>
                    <h4>Overflowing text to show scroll behavior</h4>
                    <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
                    <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                    <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
                    <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                    <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
                    <p class="mb-0">Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <div class="line"></div>

    <h4>Modal - Optional Sizes</h4>

    <!-- Large modal -->
    <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target=".bs-example-modal-lg">Large modal</button>

    <div class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">Modal Heading</h4>
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div class="modal-body">
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
                    <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                    <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
                    <p class="mb-0">Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Small modal -->
    <button class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target=".bs-example-modal-sm">Small modal</button>

    <div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">Modal Heading</h4>
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-0">Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Scrollable modal -->
    <button class="btn btn-info me-2" data-bs-toggle="modal" data-bs-target=".bs-example-modal-scrollable">Scrollable modal</button>

    <div class="modal fade bs-example-modal-scrollable" tabindex="-1" role="dialog" aria-labelledby="scrollableModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">Modal Heading</h4>
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-0">Objectively disintermediate fully researched metrics via cooperative markets. Proactively implement superior portals and alternative potentialities. Continually e-enable multifunctional architectures and resource sucking data. Efficiently productivate e-business architectures after maintainable internal or "organic" sources. Efficiently administrate equity invested metrics rather than turnkey networks.

                    Globally cultivate state of the art outsourcing with 24/365 ideas. Globally disintermediate clicks-and-mortar mindshare rather than proactive experiences. Assertively synthesize long-term high-impact processes through premier opportunities. Appropriately utilize extensive core competencies without ethical systems. Dynamically revolutionize superior architectures after scalable "outside the box" thinking.

                    Energistically initiate low-risk high-yield paradigms through viral relationships. Collaboratively morph inexpensive initiatives vis-a-vis installed base bandwidth. Collaboratively leverage existing transparent e-commerce before clicks-and-mortar e-commerce. Conveniently morph progressive scenarios vis-a-vis long-term high-impact strategic theme areas. Objectively impact user friendly users and performance based vortals.

                    Objectively disintermediate fully researched metrics via cooperative markets. Proactively implement superior portals and alternative potentialities. Continually e-enable multifunctional architectures and resource sucking data. Efficiently productivate e-business architectures after maintainable internal or "organic" sources. Efficiently administrate equity invested metrics rather than turnkey networks.

                    Globally cultivate state of the art outsourcing with 24/365 ideas. Globally disintermediate clicks-and-mortar mindshare rather than proactive experiences. Assertively synthesize long-term high-impact processes through premier opportunities. Appropriately utilize extensive core competencies without ethical systems. Dynamically revolutionize superior architectures after scalable "outside the box" thinking.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Fullscreen modal -->
    <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target=".bs-example-modal-fs">Fullscreen modal</button>

    <div class="modal fade bs-example-modal-fs" tabindex="-1" role="dialog" aria-labelledby="fsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">Modal Heading</h4>
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-0">Objectively disintermediate fully researched metrics via cooperative markets. Proactively implement superior portals and alternative potentialities. Continually e-enable multifunctional architectures and resource sucking data. Efficiently productivate e-business architectures after maintainable internal or "organic" sources. Efficiently administrate equity invested metrics rather than turnkey networks.

                    Globally cultivate state of the art outsourcing with 24/365 ideas. Globally disintermediate clicks-and-mortar mindshare rather than proactive experiences. Assertively synthesize long-term high-impact processes through premier opportunities. Appropriately utilize extensive core competencies without ethical systems. Dynamically revolutionize superior architectures after scalable "outside the box" thinking.

                    Energistically initiate low-risk high-yield paradigms through viral relationships. Collaboratively morph inexpensive initiatives vis-a-vis installed base bandwidth. Collaboratively leverage existing transparent e-commerce before clicks-and-mortar e-commerce. Conveniently morph progressive scenarios vis-a-vis long-term high-impact strategic theme areas. Objectively impact user friendly users and performance based vortals.

                    Objectively disintermediate fully researched metrics via cooperative markets. Proactively implement superior portals and alternative potentialities. Continually e-enable multifunctional architectures and resource sucking data. Efficiently productivate e-business architectures after maintainable internal or "organic" sources. Efficiently administrate equity invested metrics rather than turnkey networks.

                    Globally cultivate state of the art outsourcing with 24/365 ideas. Globally disintermediate clicks-and-mortar mindshare rather than proactive experiences. Assertively synthesize long-term high-impact processes through premier opportunities. Appropriately utilize extensive core competencies without ethical systems. Dynamically revolutionize superior architectures after scalable "outside the box" thinking.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Centered modal -->
    <button class="btn btn-danger me-2" data-bs-toggle="modal" data-bs-target=".bs-example-modal-centered">Vertically centered modal</button>

    <div class="modal fade bs-example-modal-centered" tabindex="-1" role="dialog" aria-labelledby="centerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">Modal Heading</h4>
                    <button type="button" class="btn-close btn-sm" data-bs-dismiss="modal" aria-hidden="true"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-0">Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="divider"><i class="icon-circle"></i></div>

    <h3>Popovers</h3>

    <button type="button" class="btn btn-secondary me-2" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="right" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">Popover on right</button>
    <button type="button" class="btn btn-secondary me-2" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">Popover on top</button>
    <button type="button" class="btn btn-secondary me-2" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="bottom" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">Popover on bottom</button>
    <button type="button" class="btn btn-secondary me-2" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="left" data-bs-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">Popover on left</button>

    <div class="divider"><i class="icon-circle"></i></div>

    <h3>Tooltips</h3>

    <button type="button" class="btn btn-secondary me-2" data-bs-toggle="tooltip" data-bs-placement="right" title="Tooltip on right">Tooltip on right</button>

    <button type="button" class="btn btn-secondary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top">Tooltip on top</button>

    <button type="button" class="btn btn-secondary me-2" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tooltip on bottom">Tooltip on bottom</button>

    <button type="button" class="btn btn-secondary me-2" data-bs-toggle="tooltip" data-bs-placement="left" title="Tooltip on left">Tooltip on left</button>

    <div class="divider"><i class="icon-circle"></i></div>

    <h3>Notification Types</h3>

    <a href="#" class="btn btn-info me-2" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Show Info</a>

    <a href="#" class="btn btn-danger me-2" data-notify-type="error" data-notify-msg="<i class='icon-remove-sign me-1'></i> Incorrect Input. Please Try Again!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Show Error</a>

    <a href="#" class="btn btn-success me-2" data-notify-type="success" data-notify-msg="<i class='icon-ok-sign me-1'></i> Message Sent Successfully!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Show Success</a>

    <a href="#" class="btn btn-warning me-2" data-notify-type="warning" data-notify-msg="<i class='icon-warning-sign me-1'></i> Don't try to be too Smart!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Show Warning</a>

    <div class="line"></div>

    <h4>Notification Positions</h4>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="top-left" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Top Left</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="top-center" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Top Center</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="top-right" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Top Right</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="bottom-left" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Bottom Left</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="bottom-center" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Bottom Center</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="bottom-right" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Bottom Right</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="middle-left" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Middle Left</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="middle-center" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Middle Center</a>

    <a href="#" class="btn btn-secondary me-2 mb-2" data-notify-position="middle-right" data-notify-type="info" data-notify-msg="<i class='icon-info-sign me-1'></i> Welcome to  Demo!" onclick="SEMICOLON.widget.notifications({ el: this }); return false;">Middle Right</a>

    <div class="line"></div>

    <h4>Custom Target</h4>

    <button type="button" class="btn btn-primary" id="liveToastBtn"  onclick="SEMICOLON.widget.notifications({ el: this }); return false;" data-notify-trigger="custom" data-notify-target="#liveToast">Show Notification</button>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 699;">
        <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Bootstrap</strong>
                <small>11 mins ago</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Hello, world! This is a Notification!
            </div>
        </div>
    </div>
    `
}