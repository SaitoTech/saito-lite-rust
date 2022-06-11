

module.exports = (app) => {

    return `
  <div id="saito-container" id="container ">
  <div class="saito-tab-content">

      <div class="saito-tab show" id="general">
      <div class="saito-marb-3">
          <h4 class="saito-marb-2">Fieldset</h4>
          <fieldset
              class="saito-box saito-box-padding saito-box-shadow  saito-box-rounded saito-white-background ">

              <h1>h1 Heading</h1>
              <h2>h2 Heading</h2>
              <h3>h3 Heading</h3>
              <h4>h4 Sub Heading</h4>
              <h5>h5 Sub Heading</h5>
              <h6 >h6 Sub Heading</h4>

          
                      <p class="saito-large-p ">Large Paragraph

                      </p>
                      <p class="saito-marb-2">Medium Paragraph

                      </p>
                      <p class="saito-small-p">Small Paragraph

                      </p>
          </fieldset>
    </div>

        <div>
          <h4 class=" saito-marb-2">Pre</h4>
        
              <pre>
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
      </div>


      <div class="saito-tab" id="forms">

        <div class=" saito-marb-3">
          <h4 class=" saito-marb-2">Buttons </h4>
          <div>
              <button>Primary</button>
              <button class="saito-btn-secondary d">Secondary</button>
              <button class="saito-btn-gradient">Gradient</button>
              <button class="saito-btn-small">Small</button>
              <button class="saito-btn-secondary saito-btn-large">Large Secondary</button>
          </div>
        </div>

        <div class=" saito-marb-3">
          <h4 class=" saito-marb-2">Form Items</h4>
          <form
              class="saito-box saito-box-padding saito-box-shadow  saito-box-rounded  saito-white-background">



              <h4>Title</h4>
              <p class="saito-marb-2">This is a row of plain text.</p>

              <div class="saito-marb-2">
              <label>Password</label>
              <div><input id="password" type="password" placeholder="Password" class="password" />
              </div>
              </div>
              <div>
              <div class="saito-marb-2">
              <label>Text Input</label>
              <div><input placeholder="Text Field" type="text"></input></div>
              </div>
              </div>
              <div class="saito-marb-2">
              <label>Date Input</label>
              <div><input type="text" name="datepicker"></input></div>
              </div>
              <div class="saito-marb-2">
              <label>Range Input</label>
              <div><input type="range" value="8"></input></div>
              </div>
              <div class="saito-marb-2">
              <label>Checkboxes</label>
              <div><input type="checkbox" checked></input><input type="checkbox"></input><input
                      type="checkbox"></input><input type="checkbox"></input></div>
              </div>
              <div>
              <label>Radio Buttons</label>
              <div><input name="radioId" type="radio" checked></input><input name="radioId"
                      type="radio"></input><input name="radioId" type="radio"></input><input name="radioId"
                      type="radio"></input></div>
              </div>

              <div class="saito-marb-2">
              <label>Select</label>

              <select class="saito-new-select saito-select-border">
                  <option value="0">Select:</option>
                  <option value="1">Cobb</option>
                  <option value="2">Eames</option>
                  <option value="3">Ariadne</option>
                  <option value="4">Arthur</option>
                  <option value="5">Yusuf</option>
                  <option value="6">Mal</option>
                  <option value="7">Fishcer</option>
                  <option value="8">Saito</option>
              </select>
             
              </div>

              <div class="saito-marb-2">
              <label>Text Area</label>
              <textarea placeholder="Text area">Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank chicken shankle cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken, boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip meatloaf picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.
              </textarea>
              </div>
          </form>
          </div>
      </div>
      <div class="saito-tab " id="grids">
          <h4>Grid System</h4>
          <div class=" saito-mart-2 saito-pad-2">
              <div class="saito-grid-1-1 ">
                  <div class=" saito-white-background  saito-padx-2"> 1/2 </div>
                  <div class="saito-padx-2 saito-primary-background saito-white-color"> 1/2 </div>
              </div>
              <div class="saito-grid-1-1-1 ">
                  <div class=" saito-white-background  saito-padx-2"> 1/3 </div>
                  <div class="saito-padx-2 saito-primary-background saito-white-color"> 1/3 </div>
                  <div class="saito-secondary-background saito-white-color  saito-padx-2"> 1/3</div>
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
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                      Nisi tempora
                                      numquam
                                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                      ipsum iure
                                      dolores
                                      alias hic! </p>
                              </div>
                              <div class="saito-infobox-footer">
                                  <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>
                      </div>
                      <div class=" saito-padx-2">
                          <div class="saito-infobox saito-box-padding saito-box-rounded saito-box-shadow">
                              <div class="saito-infobox-title">
                                  <h4> h4 Sub Heading </h4>
                                  <h3> h3 Sub Heading </h3>
                              </div>
                              <div class="saito-infobox-body">
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                      Nisi tempora
                                      numquam
                                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                      ipsum iure
                                      dolores
                                      alias hic! </p>

                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>
                      </div>
                      <div class=" saito-padx-2">
                          <div class="saito-infobox saito-box-padding saito-box-rounded  saito-box-shadow">
                              <div class="saito-infobox-title">
                                  <h4> h4 Sub Heading </h4>
                                  <h3> h3 Sub Heading </h3>
                              </div>
                              <div class="saito-infobox-body">
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                  </p>
                                  <br />
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>

                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

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
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                      Nisi tempora
                                      numquam
                                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                      ipsum iure
                                      dolores
                                      alias hic! </p>

                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>
                      </div>
                      <div class=" saito-padx-2">
                          <div class="saito-infobox  saito-box-padding saito-box-rounded  saito-box-shadow">
                              <div class="saito-infobox-title">
                                  <h4> h4 Sub Heading </h4>
                                  <h3> h3 Sub Heading </h3>
                              </div>
                              <div class="saito-infobox-body">
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                  </p>
                                  <br />
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>

                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

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

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>
                      </div>
                      <div class="saito-padx-2">
                          <div class="saito-infobox saito-box-padding  saito-box-shadow">
                              <div class="saito-infobox-title">
                                  <h4> h4 Sub Heading </h4>
                                  <h3> h3 Sub Heading </h3>
                              </div>
                              <div class="saito-infobox-body">
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                  </p>


                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>
                      </div>
                      <div class="saito-padx-2">
                          <div class="saito-infobox saito-box-padding  saito-box-shadow">
                              <div class="saito-infobox-title">
                                  <h4> h4 Sub Heading </h4>
                                  <h3> h3 Sub Heading </h3>
                              </div>
                              <div class="saito-infobox-body">
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                  </p>
                                  <p> Nisi tempora numquam accusamus nam iste reiciendis tempore consequatur incidunt,
                                      dignissimos sit
                                      odio ipsum iure dolores alias hic! </p>


                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>

                      </div>
                  </div>
                  <div class="saito-grid-1-1">
                      <div class="saito-padx-2">
                          <div class="saito-contentbox saito-box-padding saito-box-shadow">
                              <h4> h4 Sub heading </h4>
                              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi
                                  tempora
                                  numquam
                                  accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                  ipsum iure dolores
                                  alias hic! </p>

                          </div>
                      </div>
                      <div class="saito-padx-2">
                          <div class="saito-contentbox saito-box-padding saito-box-shadow">
                              <h4>h4 Sub heading</h4>
                              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi
                                  tempora
                                  numquam
                                  accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                  ipsum iure dolores
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
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                      Nisi tempora
                                      numquam
                                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                      ipsum iure
                                      dolores
                                      alias hic! </p>


                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

                          </div>
                      </div>
                      <div class="saito-padx-2">
                          <div class="saito-infobox  saito-box-secondary ">
                              <div class="saito-infobox-title">
                                  <h4> h4 Sub Heading </h4>
                                  <h3> h2 Sub Heading </h3>
                              </div>
                              <div class="saito-infobox-body">
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                      Nisi tempora
                                      numquam
                                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                      ipsum iure
                                      dolores
                                      alias hic! </p>


                              </div>

                              <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button>
                              </div>

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
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 1 </span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 2</span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 3</span>
                              </li>
                          </ul>
                      </div>
                  </div>
                  <div class="saito-padx-3">
                      <div class="saito-menu-container saito-menu-right  saito-white-background">
                          <ul>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 1 </span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 2</span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 3</span>
                              </li>
                          </ul>
                      </div>
                  </div>
                  <div class="saito-padx-3 ">
                      <div class="saito-menu-container saito-menu-right  saito-white-background">
                          <ul>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Really Long Menu 1 </span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 2</span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
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
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 1 </span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 2</span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 3</span>
                              </li>
                          </ul>
                      </div>
                  </div>
                  <div class="saito-padx-3">
                      <div class="saito-menu-container saito-menu-right  saito-menu-rounded saito-white-background  ">
                          <ul>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 1 </span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 3</span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 3</span>
                              </li>
                          </ul>
                      </div>
                  </div>
                  <div class="saito-padx-3 ">
                      <div class="saito-menu-container  saito-menu-right  saito-menu-rounded saito-white-background">
                          <ul>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Really Long Menu 1 </span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
                                  <span> Menu 2</span>
                              </li>
                              <li>
                                  <i class="far fa-address-card "> </i>
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
                      <div class="saito-user-list saito-user-rectangle saito-pad-2 saito-pad-2 saito-white-background ">
                          <div class="saito-user">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>Saitolicious</p>
                                  <span>Tacos, the Saito Network and Saito Consensus</span>
                              </div>
                              <i class="fas fa-ellipsis-v"></i>
                              <div class="saito-user-dropdown">
                                  <div class="saito-menu-container">
                                      <ul>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 1 </span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 2</span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 3</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>Blackjack </p>
                                  <span>Classic casino game with home rules. Try to get closest to 21 without busting, b... </span>
                                  

                              </div>
                              <i class="fas fa-ellipsis-v"></i>
                              <div class="saito-user-dropdown">
                                  <div class="saito-menu-container">
                                      <ul>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 1 </span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 2</span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 3</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                          <div class="saito-user">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>Chess </p>
                                  <span> An implementation of the Chess for the Saito Blockchain </span>
                              </div>
                              <i class="fas fa-ellipsis-v"></i>
                              <div class="saito-user-dropdown">
                                  <div class="saito-menu-container">
                                      <ul>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 1 </span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 2</span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
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
                              <div class="saito-user-info">
                                  <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    
                              </div>
          
                          </div>
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                                  <span> Active at 9.00am </span>
                              </div>
                            
                              
                          </div>
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                                  <span> Active at 9.00am </span>

                              </div>
                               <p> Report </p>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="saito-grid-1-1">
                  <div class="saito-padx-3">
                      <div class="saito-user-list saito-user-rectangle saito-user-dense saito-pad-2 saito-pad-2 saito-white-background ">
                          <div class="saito-user">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>Saitolicious</p>
                                  <span>Tacos, the Saito Network and Saito Consensus</span>
                              </div>
                              <i class="fas fa-ellipsis-v"></i>
                              <div class="saito-user-dropdown">
                                  <div class="saito-menu-container">
                                      <ul>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 1 </span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 2</span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 3</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>Blackjack </p>
                                  <span>Classic casino game with home rules. Try to get closest to 21 without busting, b... </span>
                                  

                              </div>
                              <i class="fas fa-ellipsis-v"></i>
                              <div class="saito-user-dropdown">
                                  <div class="saito-menu-container">
                                      <ul>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 1 </span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 2</span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 3</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                          <div class="saito-user">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>Chess </p>
                                  <span> An implementation of the Chess for the Saito Blockchain </span>
                              </div>
                              <i class="fas fa-ellipsis-v"></i>
                              <div class="saito-user-dropdown">
                                  <div class="saito-menu-container">
                                      <ul>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 1 </span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 2</span>
                                          </li>
                                          <li>
                                              <i class="far fa-address-card "> </i>
                                              <span> Menu 3</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="saito-padx-3">
                      <div class="saito-user-list saito-user-dense saito-pad-2 saito-white-background  ">
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    
                              </div>
          
                          </div>
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                                  <span> Active at 9.00am </span>
                              </div>
                            
                              
                          </div>
                          <div class="saito-user ">
                              <img src="/saito/img/background.png" />
                              <div class="saito-user-info">
                                  <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                                  <span> Active at 9.00am </span>

                              </div>
                               <p> Report </p>
                          </div>
                      </div>
                  </div>
              </div>
           
              
          </div>
      </div>


      <div class="saito-tab" id="examples">


          <div class="saito-grid-1-5">
              <div id="saito-left-sidebar">
                <div class="saito-left-menu saito-marb-1">
                   <div class="saito-left-menu-header">
                        <h5> Games </h5>
                     
                   </div>
                  <div class="saito-left-menu-body  ">
                      <div class="saito-menu-container saito-menu-dense ">
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


                <div class="saito-left-menu saito-marb-1">
                <div class="saito-left-menu-header">
                        <h5> Chat </h5>
                        <i class="fas fa-plus"></i>
                   </div>
                  <div class="saito-left-menu-body">
                  <div class="saito-user-list saito-user-dense saito-pad-2 saito-white-background  ">
                  <div class="saito-user  saito-marb-2">
                      <img src="/saito/img/background.png" />
                      <div class="saito-user-info">
                          <p>Saito Community Chat </p>
                          <span> new chat</span>
                      </div>
  
                  </div>
                  <div class="saito-user ">
                      <img src="/saito/img/background.png" />
                      <div class="saito-user-info">
                          <p>Saito Community Chat</p>
                          <span>new chat</span>
                      </div>
                    
                      
                  </div>
                
              </div>
                  </div>
                  </div>




              </div>

              <div id="saito-main-content">
                <div class="saito-grid-1">
                <div class="saito-user-list saito-user-rectangle saito-pad-2 saito-pad-2 saito-white-background ">
                <div class="saito-user">
                    <img src="/saito/img/doom.jpg" />
                    <div class="saito-user-info">
                        <p>Doom</p>
                        <span> Publisher:t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</span>
                    </div>
                   
                </div>
                <div class="saito-user ">
                    <img src="/saito/img/background.png" />
                    <div class="saito-user-info">
                        <p>Blackjack </p>
                        <span>Classic casino game with home rules. Try to get closest to 21 without busting, b... </span>
                        

                    </div>
               
                
                </div>
                <div class="saito-user">
                    <img src="/saito/img/background.png" />
                    <div class="saito-user-info">
                        <p>Chess </p>
                        <span> An implementation of the Chess for the Saito Blockchain </span>
                    </div>
                 
                </div>
            </div>
                </div>
                
              </div>

          </div>




          <div class="saito-chat-container">
              <div class="saito-chat-header">
                  <h6 >Community Chat</h6>
                  <i id="chat-container-close" class="fas fa-times"></i>
              </div>
              <div class="saito-chat-body">
                   <div class="saito-chat-dialog"> 
                        <div class="saito-chat-bubble">
                        <img src="/saito/img/background.png" />
                        <div >
                            <p class="saito-small-p"> dLadj1dXEDAfDaYtz1idaf3DZTAvA3eKGSRdSZo3WgQ11E</p>
                            <p class="saito-small-p"> Hi</p>
                        </div>
                        <p class="saito-small-p">22.23</p>
                        </div>
                        <div class="saito-chat-bubble">
                        <img src="/saito/img/background.png" />
                        <div >
                            <p class="saito-small-p"> gLWj1XEDAfDaYtz1ifpf3DZTAvA3eKGSRdSZo3WgQ11E</p>
                            <p class="saito-small-p"> Hey</p>
                        </div>
                        <p class="saito-small-p">22.23</p>
                        </div>
                   </div>
              </div>
              <div class="saito-chat-input-container">

                  <input type="text" placeholder="Type message" />
                  <i id="saito-sendmsg-btn" class="fas fa-paper-plane"></i>
              </div>
          </div>

      </div>

      <div class="saito-tab" id="components">
          <h4 class="saito-marb-2"> Components </h4>
          <div>
              <button id="salert_btn"> salert </button>
              <button id="sprompt_btn"> sprompt </button>
              <button id="sconfirm_btn"> sconfirm </button>

              <button id="sitemsg_btn"> siteMessage </button>
              <button id="changetheme_btn"> Change theme </button>
          </div>
      </div>
  </div>
</div>
  `;

}



