

module.exports = (app) => {

  return `
  <div class="saito-container" id="container saito-marb-6">

    <div class="saito-contentbox saito-box-padding saito-box-shadow saito-marb-2">
      <h3>h3 - Module header</h3>
    </div>
    <br />

    <div id="tab-buttons" class="saito-tab-buttons saito-mary-3">
      <ul class="saito-white-background">
        <li active class="active" data-target="#general"> General </li>
        <li data-target="#forms"> Forms </li>
        <li data-target="#grids"> Grids </li>
        <li data-target="#boxes"> Boxes </li>
        <li data-target="#menus"> Menus </li>
        <li data-target="#user_lists"> User Lists </li>
        <li data-target="#examples"> Examples </li>
        <li data-target="#components"> Components </li>
      </ul>
    </div>


    <div class="saito-tab-content">

      <div class="saito-tab show" id="general">
        <h4 class="">Fieldset</h4>
        <fieldset
          class="saito-box saito-box-padding saito-box-shadow  saito-box-rounded saito-white-background saito-mart-2">

          <h1 class="">h1 Heading</h1>
          <h2 class="">h2 Heading</h2>
          <h3 class="">h3 Heading</h3>
          <h4 class="">h4 Sub Heading</h4>
          <h5>h4 Sub Heading</h5>
          <h6>h4 Sub Heading</h4>
            <p>Paragraph Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank
              chicken
              shankle
              cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken,
              boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip
              meatloaf
              picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.

            </p>
        </fieldset>
      </div>

      <div class="saito-tab" id="forms">

        <h4>Buttons </h4>
        <div class="saito-mart-2">
          <button>Primary</button>
          <button class="saito-btn-secondary d">Secondary</button>
          <button class="saito-btn-gradient">Gradient</button>
          <button class="saito-btn-small">Small</button>
          <button class="saito-btn-secondary saito-btn-large">Large</button>
        </div>


        <h4>Form Items</h4>
        <form
          class="saito-box saito-box-padding saito-box-shadow  saito-box-rounded  saito-white-background saito-mart-2">



          <h4>Title</h4>
          <p>This is a row of plain text.</p>
          <label>Password</label>
          <div><input id="password" type="password" placeholder="This is a password field" class="password" /></div>
          <label>Text Input</label>
          <div><input placeholder="Text Field" type="text"></input></div>
          <label>Date Input</label>
          <div><input type="text" name="datepicker"></input></div>
          <label>Range Input</label>
          <div><input type="range" value="8"></input></div>
          <label>Checkboxes</label>
          <div><input type="checkbox" checked></input><input type="checkbox"></input><input
              type="checkbox"></input><input type="checkbox"></input></div>
          <label>Radio Buttons</label>
          <div><input name="radioId" type="radio" checked></input><input name="radioId" type="radio"></input><input
              name="radioId" type="radio"></input><input name="radioId" type="radio"></input></div>
          <label>Select</label>

          <select class="saito-new-select saito-select-border">
            <option value="0">Select option:</option>
            <option value="1">Cobb</option>
            <option value="2">Eames</option>
            <option value="3">Ariadne</option>
            <option value="4">Arthur</option>
            <option value="5">Yusuf</option>
            <option value="6">Mal</option>
            <option value="7">Fishcer</option>
            <option value="8">Saito</option>
          </select>
          <select class="saito-new-select ">
            <option value="1">Cobb</option>
            <option value="2">Eames</option>
            <option value="3">Ariadne</option>
            <option value="4">Arthur</option>
            <option value="5">Yusuf</option>
            <option value="6">Mal</option>
            <option value="7">Fishcer</option>
            <option value="8">Saito</option>
          </select>


          <label>Text Area</label>
          <textarea placeholder="Text area">
                Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank chicken shankle cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken, boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip meatloaf picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.
            </textarea>
        </form>






        <hr />





        <h4>Pre</h4>
        <pre class="saito-mart-2">
          {
              "bf": 1,
              "coinbase": "478016666.66666667",
              "creator": "z1UA26VVMkAKudvDVm9BseGGtq1bfdWz2msp4mMwjRPX",
              "difficulty": 0,
              "id": 2,
              "merkle": "",
              "paysplit": 0.5,
              "powsplit": 0.5,
              "prevbsh": "cb7cdd9633bf67cd3eff12266eb462018f239a78b666059ea3e7088c3f355b04",
              "reclaimed": "0.0",
              "sr": 0,
              "stakepool": "0",
              "treasury": "2390083333.33333333",
              "ts": 1572407380711
              }
      </pre>


      </div>









      <div class="saito-tab " id="grids">
        <h4>Grid System</h4>
        <div class=" saito-mart-2 saito-pad-2">
          <div class="saito-grid-1-1 ">
            <div class=" saito-white-background  saito-padx-2"> 1/4 </div>
            <div class="saito-padx-2 saito-primary-background saito-white-color"> 1/4 </div>
          </div>
          <div class="saito-grid-1-1-1 ">
            <div class=" saito-white-background  saito-padx-2"> 1/4 </div>
            <div class="saito-padx-2 saito-primary-background saito-white-color"> 1/4 </div>
            <div class="saito-secondary-background saito-white-color  saito-padx-2"> 2/4 </div>
          </div>

          <div class="saito-grid-1-2-1">
            <div class=" saito-white-background  saito-padx-2"> 1/4 </div>
            <div class=" saito-padx-2 saito-primary-background saito-white-color"> 2/4</div>
            <div class="saito-secondary-background saito-white-color  saito-padx-2"> 1/4 </div>
          </div>
          <div class="saito-grid-2-1-1">
            <div class=" saito-white-background  saito-padx-2">2/4 </div>
            <div class="saito-padx-2 saito-primary-background saito-white-color"> 1/4 </div>
            <div class="saito-secondary-background saito-white-color  saito-padx-2">1/4 </div>
          </div>
          <div class="saito-grid-1-3">
            <div class="saito-white-background  saito-padx-2"> 1/4</div>
            <div class=" saito-padx-2 saito-primary-background saito-white-color"> 3/4 </div>

          </div>

          <div class="saito-grid-1-1-1-1">
            <div class="saito-white-background  saito-padx-2"> 1/4</div>
            <div class="saito-padx-2 saito-primary-background saito-white-color"> 1/4 </div>
            <div class="saito-secondary-background saito-white-color  saito-padx-2"> 1/4 </div>
            <div class="saito-padx-2 saito-white-background "> 1/4 </div>

          </div>
        </div>
      </div>

      <div class="saito-tab" id="boxes">
        <h4>Boxes</h4>
        <div class="saito-mart-2">
          <div class="saito-gray-background">
            <div class="saito-grid-1-1-2">
              <div class=" saito-padx-2">
                <div class="saito-infobox saito-box-padding saito-box-rounded saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                      numquam
                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure
                      dolores
                      alias hic! </p>

                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
              <div class=" saito-padx-2">
                <div class="saito-infobox saito-box-padding saito-box-rounded saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                      numquam
                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure
                      dolores
                      alias hic! </p>

                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
              <div class=" saito-padx-2">
                <div class="saito-infobox saito-box-padding saito-box-rounded  saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo </p>
                    <br />
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>

                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
            </div>
            <div class="saito-grid-1-1">
              <div class=" saito-padx-2">
                <div class="saito-infobox saito-box-padding saito-box-rounded saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                      numquam
                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure
                      dolores
                      alias hic! </p>

                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
              <div class=" saito-padx-2">
                <div class="saito-infobox  saito-box-padding saito-box-rounded  saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo </p>
                    <br />
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>

                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
            </div>

            <div class="saito-grid-1-1-1">
              <div class=" saito-padx-2">
                <div class="saito-infobox  saito-box-padding saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>
                    <br />
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>
                    <br />
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>


                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
              <div class="saito-padx-2">
                <div class="saito-infobox saito-box-padding  saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo </p>


                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
              <div class="saito-padx-2">
                <div class="saito-infobox saito-box-padding  saito-box-shadow">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo</p>
                    <p> Nisi tempora numquam accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit
                      odio ipsum iure dolores alias hic! </p>


                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>

              </div>
            </div>
            <div class="saito-grid-1-1">
              <div class="saito-padx-2">
                <div class="saito-contentbox saito-box-padding saito-box-shadow">
                  <h4> h4 Sub heading </h4>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                    numquam
                    accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
                    alias hic! </p>

                </div>
              </div>
              <div class="saito-padx-2">
                <div class="saito-contentbox saito-box-padding saito-box-shadow">
                  <h4>h4 Sub heading</h4>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                    numquam
                    accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
                    alias hic! </p>

                </div>
              </div>
            </div>
          </div>
          <div class="saito-white-background saito-pad-2 ">
            <div class="saito-grid-1-1">
              <div class="">
                <div class="saito-infobox saito-box-secondary ">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h3 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                      numquam
                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure
                      dolores
                      alias hic! </p>


                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
              <div class="saito-padx-2">
                <div class="saito-infobox  saito-box-secondary ">
                  <div class="saito-infobox-title">
                    <h4> h4 Sub Heading </h4>
                    <h3> h2 Sub Heading </h3>
                  </div>
                  <div class="saito-infobox-body">
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora
                      numquam
                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure
                      dolores
                      alias hic! </p>


                  </div>

                  <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>

                </div>
              </div>
            </div>

          </div>

        </div>
      </div>





      <div class="saito-tab" id="menus">
        <h4>Menus</h4>
        <div class="saito-mart-2">
          <div class="saito-grid-1-1-1">
            <div class=" saito-padx-3">
              <div class="saito-menu-container  saito-white-background">
                <ul>
                  <li class="no-icon">
                    <i class="far fa-address-card saito-primary-color"> </i>
                    <span> Menu 1 </span>
                  </li>
                  <li>
                    <i class="fab fa-airbnb saito-primary-color"> </i>
                    <span> Menu 2</span>
                  </li>
                  <li>
                    <i class="fas fa-allergies saito-primary-color"> </i>
                    <span> Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="saito-padx-3">
              <div class="saito-menu-container saito-menu-right  saito-white-background">
                <ul>
                  <li>
                    <i class="far fa-address-card saito-primary-color"> </i>
                    <span> Menu 1 </span>
                  </li>
                  <li>
                    <i class="fab fa-airbnb saito-primary-color"> </i>
                    <span> Menu 2</span>
                  </li>
                  <li>
                    <i class="fas fa-allergies saito-primary-color"> </i>
                    <span> Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="saito-padx-3 ">
              <div class="saito-menu-container saito-menu-right  saito-white-background">
                <ul>
                  <li>
                    <i class="far fa-address-card saito-primary-color"> </i>
                    <span> Really Long Menu 1 </span>
                  </li>
                  <li>
                    <i class="fab fa-airbnb saito-primary-color"> </i>
                    <span> Menu 2</span>
                  </li>
                  <li>
                    <i class="fas fa-allergies saito-primary-color"> </i>
                    <span> Really Long Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="saito-grid-1-1-1">
            <div class="saito-padx-3">
              <div class="saito-menu-container  saito-menu-rounded  saito-white-background ">
                <ul>
                  <li>
                    <i class="far fa-address-card saito-primary-color"> </i>
                    <span> Menu 1 </span>
                  </li>
                  <li>
                    <i class="fab fa-airbnb saito-primary-color"> </i>
                    <span> Menu 2</span>
                  </li>
                  <li>
                    <i class="fas fa-allergies saito-primary-color"> </i>
                    <span> Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="saito-padx-3">
              <div class="saito-menu-container saito-menu-right  saito-menu-rounded saito-white-background  ">
                <ul>
                  <li>
                    <i class="far fa-address-card saito-primary-color"> </i>
                    <span> Menu 1 </span>
                  </li>
                  <li>
                    <i class="fab fa-airbnb saito-primary-color"> </i>
                    <span> Menu 3</span>
                  </li>
                  <li>
                    <i class="fas fa-allergies saito-primary-color"> </i>
                    <span> Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="saito-padx-3 ">
              <div class="saito-menu-container  saito-menu-right  saito-menu-rounded saito-white-background">
                <ul>
                  <li>
                    <i class="far fa-address-card saito-primary-color"> </i>
                    <span> Really Long Menu 1 </span>
                  </li>
                  <li>
                    <i class="fab fa-airbnb saito-primary-color"> </i>
                    <span> Menu 2</span>
                  </li>
                  <li>
                    <i class="fas fa-allergies saito-primary-color"> </i>
                    <span> Really Long Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="saito-grid-1-1-1">
            <div class="saito-padx-3">
              <div class="saito-menu-container  saito-menu-rounded  saito-white-background">
                <ul>
                  <li>

                    <span> Menu 1 </span>
                  </li>
                  <li>

                    <span> Menu 2</span>
                  </li>
                  <li>

                    <span> Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="saito-padx-3">
              <div class="saito-menu-container saito-menu-right saito-menu-rounded   saito-white-background">
                <ul>
                  <li>

                    <span> Menu 1 </span>
                  </li>
                  <li>

                    <span> Menu 3</span>
                  </li>
                  <li>

                    <span> Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="saito-padx-3 ">
              <div class="saito-menu-container  saito-menu-right saito-menu-rounded  saito-white-background">
                <ul>
                  <li>

                    <span> Really Long Menu 1 </span>
                  </li>
                  <li>

                    <span> Menu 2</span>
                  </li>
                  <li>

                    <span> Really Long Menu 3</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="saito-tab" id="user_lists">
        <h4> User Lists </h4>
        <div class="saito-mart-2">
          <div class="saito-grid-1-1">
            <div class="saito-padx-3">
              <div class="saito-user-list saito-pad-2 saito-pad-2 saito-white-background ">
                <div class="saito-user">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>davikstone@satio.io </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="saito-padx-3">
              <div class="saito-user-list saito-pad-2 saito-white-background  ">
                <div class="saito-user ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="saito-grid-1-1">
            <div class="saito-padx-3">
              <div class="saito-user-list saito-pad-2 saito-white-background ">
                <div class="saito-user saito-user-medium ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-medium ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-medium ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>davikstone@satio.io </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="saito-padx-3">
              <div class="saito-user-list   saito-pad-2 saito-white-background  ">
                <div class="saito-user saito-user-medium ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-medium ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <span> Active at 9.00am </span>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-medium ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="saito-grid-1-1">
            <div class="saito-padx-3">
              <div class="saito-user-list saito-pad-2 saito-white-background ">
                <div class="saito-user saito-user-dense ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>davikstone@satio.io </p>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-dense ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-dense ">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="saito-padx-3">
              <div class="saito-user-list saito-pad-2  saito-white-background   ">
                <div class="saito-user saito-user-dense">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>davikstone@satio.io </p>
                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-dense">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="saito-user saito-user-dense">
                  <img src="/saito/img/background.png" />
                  <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>

                  </div>
                  <i class="fas fa-ellipsis-v"></i>
                  <div class="saito-user-dropdown">
                    <div class="saito-menu-container">
                      <ul>
                        <li>
                          <i class="far fa-address-card saito-primary-color"> </i>
                          <span> Menu 1 </span>
                        </li>
                        <li>
                          <i class="fab fa-airbnb saito-primary-color"> </i>
                          <span> Menu 2</span>
                        </li>
                        <li>
                          <i class="fas fa-allergies saito-primary-color"> </i>
                          <span> Menu 3</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div class="saito-tab" id="examples">
        <h4> Examples </h4>
        <div>
          <button id="salert_btn"> salert </button>
          <button id="sprompt_btn"> sprompt </button>
          <button id="sconfirm_btn"> sconfirm </button>

          <button id="sitemsg_btn"> siteMessage </button>
          <button id="changetheme_btn"> Change theme </button>
        </div>

        <div class="saito-marb-3 saito-mart-3 ">
          <h6> Low padding side box component </h6>
          <div class="saito-leftsidebar-menu saito-white-background ">
            <div class="saito-menu-container ">
              <ul>
                <li>

                  <span> BlackJack </span>
                </li>
                <li>

                  <span> Chess</span>
                </li>
                <li>
                  <span> Red Imperium</span>
                </li>
                <li>
                  <span> Poker</span>
                </li>
                <li>
                  <span> Settlers of Saitoa</span>
                </li>
                <li>
                  <span> Solitrio</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        <div class="saito-marb-3">
          <h6> Chat sidebar component </h6>

          <div class="saito-leftsidebar-chatbox saito-white-background saito-pad-2 ">
            
              <div class="saito-user saito-user-dense saito-marb-2">
                <img src="/saito/img/background.png" />
                <div>
                  <p>Saito Community Chat </p>
                  <span> New chat</span>
                </div>

              </div>
              <div class="saito-user saito-user-dense">
                <img src="/saito/img/background.png" />
                <div>
                  <p>Saito Community Chat </p>
                  <span> New chat</span>
                </div>

              </div>
           

          </div>
        </div>
        <div class="saito-marb-3 saito-gray-border">
          <h6> Chatbox component </h6>

        </div>
        <div class="saito-marb-3 saito-gray-border">
          <h6> Slide-in menu component </h6>

        </div>
        <div class="saito-marb-3 saito-gray-border">
          <h6> Module list component </h6>

        </div>
        <div class="saito-marb-3 saito-gray-border">
          <h6> Data-Table/list component </h6>

        </div>
        <div class="saito-marb-3 saito-gray-border">
          <h6> Multiple option select component </h6>

        </div>
      </div>

      <div class="saito-tab" id="components">
        <h4> Components </h4>
      </div>
    </div>






  </div>


  `;

}



