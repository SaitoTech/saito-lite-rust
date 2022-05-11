module.exports = (app) => {
    return `<header id="header" class="full-header">
    <div id="header-wrap">
        <div class="container">
            <div class="header-row">


                <div id="logo">
                    <a href="index.html" class="standard-logo" data-dark-logo="images/img/logo-dark.png"><img src="/saito/img/logo.svg" alt="Logo"></a>
                    <a href="index.html" class="retina-logo" data-dark-logo="images/img/logo-dark@2x.png"><img src="/saito/img/logo.svg" alt="Logo"></a>
                </div>




                <div id="primary-menu-trigger">
                    <svg class="svg-trigger" viewBox="0 0 100 100"><path d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"></path><path d="m 30,50 h 40"></path><path d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"></path></svg>
                </div>

                <nav class="primary-menu">

                    <ul class="menu-container">
                        <li class="menu-item">
                            <a class="menu-link" data-route="Arcade"><div>Arcade</div></a>

                        </li>

                        <li class="menu-item">
                            <a class="menu-link"  data-route="Devcenter"><div>Dev Center</div></a>

                        </li>

                        <li class="list-item big-menu-container">
                        <div class="link" id="big-menu-toggle" href="#">Shortcodes</div>
                        <div class="big-menu">
                          <a href="#" class="big-menu-link" href="">Buttons</a>
                          <a href="#" class="big-menu-link" href="">Grids</a>
                          <a href="#" class="big-menu-link" href="">Forms</a>
                          <a href="#" class="big-menu-link" href="">Selects</a>
                          <a href="#" class="big-menu-link" href="">Cards</a>
                        </div>
                      </li>
                    </ul>

                </nav>


            </div>
        </div>
    </div>
    <div class="header-wrap-clone"></div>
</header>`

}




{/* <li class="menu-item">
<a class="menu-link" data-url="?display=carousels"><div><i class="icon-heart3"></i>Carousel</div></a>
</li> */}

