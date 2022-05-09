module.exports = (app) => {

    return `
    <h3>Native Style</h3>

    <div class="style-msg successmsg">
        <div class="sb-msg"><i class="icon-thumbs-up"></i><strong>Well done!</strong> You successfully read this important alert message.</div>
    </div>

    <div class="style-msg errormsg">
        <div class="sb-msg"><i class="icon-remove"></i><strong>Oh snap!</strong> Change a few things up and try submitting again.</div>
    </div>

    <div class="style-msg infomsg">
        <div class="sb-msg"><i class="icon-info-sign"></i><strong>Heads up!</strong> This alert needs your attention, but it's not super important.</div>
    </div>

    <div class="style-msg alertmsg">
        <div class="sb-msg"><i class="icon-warning-sign"></i><strong>Warning!</strong> Better check yourself, you're not looking too good.</div>
    </div>

    <div class="style-msg" style="background-color: #EEE;">
        <div class="sb-msg"><i class="icon-question-sign"></i>This is a <strong>Blank Notification</strong> Box.</div>
    </div>

    <div class="style-msg style-msg-light" style="background-color: #333;">
        <div class="sb-msg"><i class="icon-question-sign"></i>This is a <strong>Blank Notification</strong> Box.</div>
    </div>

    <div class="line"></div>

    <h4>Extended Style Boxes</h4>

    <div class="style-msg2 errormsg">
        <div class="msgtitle">Fix the Following Errors:</div>
        <div class="sb-msg">
            <ul>
                <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi, adipisci.</li>
                <li>Placeat, et hic pariatur fugiat autem earum facere necessitatibus fuga.</li>
                <li>Aliquid, esse, perspiciatis iure rerum laudantium iste minima quas facere!</li>
                <li>Nam, ab, reiciendis magnam et odio inventore sapiente dolore vel.</li>
            </ul>
        </div>
    </div>

    <div class="style-msg2 successmsg">
        <div class="msgtitle">Some of your Successful Works:</div>
        <div class="sb-msg">
            <ul>
                <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi, adipisci.</li>
                <li>Placeat, et hic pariatur fugiat autem earum facere necessitatibus fuga.</li>
                <li>Aliquid, esse, perspiciatis iure rerum laudantium iste minima quas facere!</li>
                <li>Nam, ab, reiciendis magnam et odio inventore sapiente dolore vel.</li>
            </ul>
        </div>
    </div>

    <div class="style-msg2" style="background-color: #EEE;">
        <div class="msgtitle">Try Solving these Issues(Optional):</div>
        <div class="sb-msg">
            <ul>
                <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi, adipisci.</li>
                <li>Placeat, et hic pariatur fugiat autem earum facere necessitatibus fuga.</li>
                <li>Aliquid, esse, perspiciatis iure rerum laudantium iste minima quas facere!</li>
                <li>Nam, ab, reiciendis magnam et odio inventore sapiente dolore vel.</li>
            </ul>
        </div>
    </div>

    <div class="style-msg2 style-msg-light" style="background-color: #444;">
        <div class="msgtitle"><i class="icon-pencil2"></i>Just a Custom Color Option:</div>
        <div class="sb-msg">
            <ul>
                <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi, adipisci.</li>
                <li>Placeat, et hic pariatur fugiat autem earum facere necessitatibus fuga.</li>
                <li>Aliquid, esse, perspiciatis iure rerum laudantium iste minima quas facere!</li>
                <li>Nam, ab, reiciendis magnam et odio inventore sapiente dolore vel.</li>
            </ul>
        </div>
    </div>

    <div class="line"></div>

    <h3>Bootstrap Alerts</h3>

    <div class="alert alert-success">
      <i class="icon-gift"></i><strong>Well done!</strong> You successfully read this important alert message.
    </div>
    <div class="alert alert-info">
      <i class="icon-hand-up"></i><strong>Heads up!</strong> This alert needs your attention, but it's not super important.
    </div>
    <div class="alert alert-warning">
      <i class="icon-warning-sign"></i><strong>Warning!</strong> Better check yourself, you're not looking too good.
    </div>
    <div class="alert alert-danger">
      <i class="icon-remove-sign"></i><strong>Oh snap!</strong> Change a few things up and try submitting again.
    </div>

    <div class="line"></div>

    <h4>Bootstrap Alerts - Closable</h4>

    <div class="alert alert-dismissible alert-success">
      <i class="icon-gift"></i><strong>Well done!</strong> You successfully read this <a href="#" class="alert-link">important alert message</a>.
      <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-hidden="true"></button>
    </div>
    <div class="alert alert-dismissible alert-info">
      <i class="icon-hand-up"></i><strong>Heads up!</strong> This alert needs your attention, but it's not super important.
      <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-hidden="true"></button>
    </div>
    <div class="alert alert-dismissible alert-warning">
      <i class="icon-warning-sign"></i><strong>Warning!</strong> Better check yourself, you're not looking too good.
      <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-hidden="true"></button>
    </div>
    <div class="alert alert-dismissible alert-danger mb-0">
      <i class="icon-remove-sign"></i><strong>Oh snap!</strong> Change a few things up and try submitting again.
      <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-hidden="true"></button>
    </div>

    <div class="line"></div>

    <h4>Bootstrap Alerts - Links</h4>

    <div class="alert alert-primary" role="alert">
        A simple primary alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-secondary" role="alert">
        A simple secondary alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-success" role="alert">
        A simple success alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-danger" role="alert">
        A simple danger alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-warning" role="alert">
        A simple warning alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-info" role="alert">
        A simple info alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-light" role="alert">
        A simple light alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>
    <div class="alert alert-dark" role="alert">
        A simple dark alert with <a href="#" class="alert-link"><u>an example link</u></a>. Give it a click if you like.
    </div>

    <div class="line"></div>

    <h4>Bootstrap Alerts - Additional Content</h4>

    <div class="alert alert-success" role="alert">
        <h3 class="alert-heading mb-3">Well done!</h3>
        <p class="mb-0">Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p>
        <hr>
        <p class="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
    </div>
`;
}