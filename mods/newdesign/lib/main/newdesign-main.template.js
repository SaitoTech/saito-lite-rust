module.exports = (app) => {

    return `
  <div class="saito-tab-content">
      <div class="saito-tab active" id="general">
          <div class="saito-main">
              <div class="">
                  <h4 class="">Fieldset</h4>
                  <fieldset class="saito-box padding box-shadow  rounded saito-white-background ">
  
                      <h1>h1 Heading</h1>
                      <h2>h2 Heading</h2>
                      <h3>h3 Heading</h3>
                      <h4>h4 Sub Heading</h4>
                      <h5>h5 Sub Heading</h5>
                      <h6>h6 Sub Heading</h4>
  
  
                          <p class="saito-large-p ">Large Paragraph
  
                          </p>
                          <p class="">Medium Paragraph
  
                          </p>
                          <p class="saito-small-p">Small Paragraph
  
                          </p>
                  </fieldset>
              </div>
  
              <div>
                  <h4 class=" ">Pre</h4>
  
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
      </div>
  
  
      <div class="saito-tab" id="forms">
          <div class="saito-main">
              <div class=" ">
                  <h4 class=" ">Buttons </h4>
                  <div>
                      <button>Primary</button>
                      <button class="saito-button-secondary d">Secondary</button>
                      <button class="saito-button-gradient">Gradient</button>
                      <button class="small">Small</button>
                      <button class="saito-button-secondary large">Large Secondary</button>
                  </div>
              </div>
  
              <div class=" ">
                  <h4 class=" ">Form Items</h4>
                  <form class="saito-box padding box-shadow  rounded  saito-white-background">
  
  
  
                      <h4>Title</h4>
                      <p class="">This is a row of plain text.</p>
  
                      <div class="">
                          <label>Password</label>
                          <div><input id="password" type="password" placeholder="Password" class="password" />
                          </div>
                      </div>
                      <div>
                          <div class="">
                              <label>Text Input</label>
                              <div><input placeholder="Text Field" type="text"></input></div>
                          </div>
                      </div>
                      <div class="">
                          <label>Date Input</label>
                          <div><input type="text" name="datepicker"></input></div>
                      </div>
                      <div class="">
                          <label>Range Input</label>
                          <div><input type="range" value="8"></input></div>
                      </div>
                      <div class="">
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
  
                      <div class="">
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
  
                      <div class="">
                          <label>Text Area</label>
                          <textarea placeholder="Text area">Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank chicken shankle cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken, boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip meatloaf picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.
                            </textarea>
                      </div>
                  </form>
              </div>
          </div>
      </div>
      <div class="saito-tab " id="grids">
          <div class="saito-main">
              <h4>Grid System</h4>
              <div class="  ">
                  <div class="saito-grid-1-1 ">
                      <div class=" saito-white-background  "> 1/2 </div>
                      <div class=" saito-primary-background saito-white-color"> 1/2 </div>
                  </div>
                  <div class="saito-grid-1-1-1 ">
                      <div class=" saito-white-background  "> 1/3 </div>
                      <div class=" saito-primary-background saito-white-color"> 1/3 </div>
                      <div class="saito-secondary-background saito-white-color  "> 1/3</div>
                  </div>
  
                  <div class="saito-grid-1-2-1">
                      <div class=" saito-white-background  "> 1/4 </div>
                      <div class="  saito-primary-background saito-white-color"> 2/4</div>
                      <div class="saito-secondary-background saito-white-color  "> 1/4 </div>
                  </div>
                  <div class="saito-grid-2-1-1">
                      <div class=" saito-white-background  ">2/4 </div>
                      <div class=" saito-primary-background saito-white-color"> 1/4 </div>
                      <div class="saito-secondary-background saito-white-color  ">1/4 </div>
                  </div>
                  <div class="saito-grid-1-3">
                      <div class="saito-white-background  "> 1/4</div>
                      <div class="  saito-primary-background saito-white-color"> 3/4 </div>
  
                  </div>
  
                  <div class="saito-grid-1-1-1-1">
                      <div class="saito-white-background  "> 1/4</div>
                      <div class=" saito-primary-background saito-white-color"> 1/4 </div>
                      <div class="saito-secondary-background saito-white-color  "> 1/4 </div>
                      <div class=" saito-white-background "> 1/4 </div>
  
                  </div>
                  <div class="saito-grid-1-4">
                      <div class="saito-white-background  "> 1/5</div>
                      <div class=" saito-primary-background saito-white-color"> 4/5 </div>
  
                  </div>
                  <div class="saito-grid-4-1">
                      <div class="saito-white-background  "> 1/5</div>
                      <div class=" saito-primary-background saito-white-color"> 4/5 </div>
  
                  </div>
                  <div class="saito-grid-1-5">
                      <div class="saito-white-background  "> 1/6</div>
                      <div class=" saito-primary-background saito-white-color"> 5/6 </div>
  
                  </div>
                  <div class="saito-grid-5-1">
                      <div class="saito-white-background  "> 5/6</div>
                      <div class=" saito-primary-background saito-white-color"> 1/6 </div>
  
                  </div>
              </div>
          </div>
      </div>
      <div class="saito-tab" id="boxes">
          <div class="saito-main">
              <h4>Boxes</h4>
              <div class="">
                  <div class="saito-gray-background">
                      <h5 class="">Saito InfoBox with border-radius </h5>
                      <div class="saito-grid-1-1-1">
                          <div class=" ">
  
                              <div class="saito-infobox padding rounded box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <div class="saito-list  saito-white-background ">
                                          <div class="saito-list-user">
                                              <div class="saito-list-user-image-box">
                                                  <img class="saito-idenitcon" src="/saito/img/background.png" />
                                              </div>
                                              <div class="saito-list-user-content-box">
                                                  <div class="saito-address">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33
                                                  </div>
                                                  <p> Active at 9.00am </p>
                                              </div>
                                          </div>
                                          <div class="saito-list-user">
                                              <div class="saito-list-user-image-box">
                                                  <img class="saito-idenitcon" src="/saito/img/background.png" />
                                              </div>
                                              <div class="saito-list-user-content-box">
                                                  <div class="saito-address">Davik Stone</div>
                                                  <p> Active at 9.00am </p>
                                              </div>
                                          </div>
                                          <div class="saito-list-user">
                                              <div>
                                                  <img src="/saito/img/background.png" />
                                              </div>
                                              <div>
                                                  <div>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</div>
                                                  <p> Active at 9.00am </p>
                                              </div>
                                          </div>
  
                                      </div>
                                  </div>
                                  <div>
                                      <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                          <div class=" ">
                              <div class="saito-infobox padding rounded box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <div class="saito-menu">
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
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                          <div class=" ">
                              <div class="saito-infobox padding rounded  box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <div class="">
                                          <label>Text Input</label>
                                          <div><input placeholder="Text Field" type="text"></input></div>
                                      </div>
                                      <div class="">
                                          <label>Date Input</label>
                                          <div><input type="text" name="datepicker"></input></div>
                                      </div>
                                      <div class="">
                                          <label>Range Input</label>
                                          <div><input type="range" value="8"></input></div>
                                      </div>
  
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                      </div>
                      <h5 class="">Saito InfoBox with border-radius </h5>
                      <div class="saito-grid-1-1">
                          <div class=" ">
                              <div class="saito-infobox padding rounded box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                          Nisi tempora
                                          numquam
                                          accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                          ipsum iure
                                          dolores
                                          alias hic! </p>
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                          <div class=" ">
                              <div class="saito-infobox  padding rounded  box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                      </p>
                                      <br />
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                      </div>
                      <h5 class="">Saito InfoBox without border-radius </h5>
                      <div class="saito-grid-1-1-1">
                          <div class=" ">
                              <div class="saito-infobox  padding box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>
                                      <br />
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>
                                      <br />
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. </p>
  
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                          <div class="">
                              <div class="saito-infobox padding  box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                      </p>
  
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                          <div class="">
                              <div class="saito-infobox padding  box-shadow">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo
                                      </p>
                                      <p> Nisi tempora numquam accusamus nam iste reiciendis tempore consequatur incidunt,
                                          dignissimos sit
                                          odio ipsum iure dolores alias hic! </p>
  
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
  
                          </div>
                      </div>
                      <h5 class="">Saito ContentBox without border-radius </h5>
                      <div class="saito-grid-1-1">
                          <div class="">
                              <div class="saito-contentbox padding box-shadow">
                                  <h4> h4 Sub heading </h4>
                                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi
                                      tempora
                                      numquam
                                      accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                      ipsum iure dolores
                                      alias hic! </p>
  
                              </div>
                          </div>
                          <div class="">
                              <div class="saito-contentbox padding box-shadow">
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
                  <h5 class="">Saito InfoBox with gray background </h5>
                  <div class="saito-white-background  ">
  
                      <div class="saito-grid-1-1">
                          <div class="">
                              <div class="saito-infobox padding box-secondary ">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h3 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                          Nisi tempora
                                          numquam
                                          accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                          ipsum iure
                                          dolores
                                          alias hic! </p>
  
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                          <div class="">
                              <div class="saito-infobox padding box-secondary ">
                                  <div>
                                      <h4> h4 Sub Heading </h4>
                                      <h3> h2 Sub Heading </h3>
                                  </div>
                                  <div>
                                      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo.
                                          Nisi tempora
                                          numquam
                                          accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio
                                          ipsum iure
                                          dolores
                                          alias hic! </p>
  
  
                                  </div>
  
                                  <div> <button class="saito-button-secondary"> Button </button>
                                  </div>
  
                              </div>
                          </div>
                      </div>
  
                  </div>
  
              </div>
          </div>
      </div>
  
  
  
  
  
      <div class="saito-tab" id="menus">
          <div class="saito-main">
              <h4>Menus</h4>
              <div class="">
                  <h5> Saito Menu : Left Aligned | Right Aligned | With icon | Without Border Radius </h5>
                  <div class="saito-grid-1-1-1">
                      <div class=" ">
                          <div class="saito-menu  saito-white-background">
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
                      <div class="">
                          <div class="saito-menu right  saito-white-background">
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
                      <div class=" ">
                          <div class="saito-menu right  saito-white-background">
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
                  <h5> Saito Menu : Default Size | Left Aligned | Right Aligned | With icon | With Border Radius </h5>
                  <div class="saito-grid-1-1-1">
                      <div class="">
                          <div class="saito-menu  rounded  saito-white-background ">
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
                      <div class="">
                          <div class="saito-menu right  rounded saito-white-background  ">
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
                      <div class=" ">
                          <div class="saito-menu  right  rounded saito-white-background">
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
  
                  <h5> Saito Menu : Default Size | Left Aligned | Right Aligned | Without icon | With Border Radius </h5>
                  <div class="saito-grid-1-1-1-1">
                      <div class="">
                          <div class="saito-menu  rounded  saito-white-background">
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
                      <div class="">
                          <div class="saito-menu right rounded   saito-white-background">
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
                      <div class=" ">
                          <div class="saito-menu  right rounded  saito-white-background">
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
                  <h5> Saito Menu : Small Size | Left Aligned | Right Aligned | Without icon | Without Border Radius </h5>
                  <div class="saito-grid-1-1-1">
                      <div class=" ">
                          <div class="saito-menu  saito-white-background ">
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
                      <div class="">
                          <div class="saito-menu right  saito-white-background ">
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
                      <div class=" ">
                          <div class="saito-menu right  saito-white-background ">
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
              </div>
          </div>
      </div>
  
  
      <div class="saito-tab" id="user_lists">
          <div class="saito-main">
              <h4> User Lists </h4>
              <div class="">
                  <div class="saito-grid-1-1">
                      <div class="">
                          <h5> Saito User List: </h5>
                          <div class="saito-list  saito-white-background ">
                              <div class="saito-list-user">
                                  <div class="saito-list-user-image-box">
                                      <img class="saito-idenitcon" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-user-content-box">
                                      <div class="saito-address">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</div>
                                      <p> Active at 9.00am </p>
                                  </div>
                              </div>
                              <div class="saito-list-user">
                                  <div class="saito-list-user-image-box">
                                      <img class="saito-idenitcon" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-user-content-box">
                                      <div class="saito-address">Davik Stone</div>
                                      <p> Active at 9.00am </p>
                                  </div>
                              </div>
                              <div class="saito-list-user">
                                  <div>
                                      <img src="/saito/img/background.png" />
                                  </div>
                                  <div>
                                      <div>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</div>
                                      <p> Active at 9.00am </p>
                                  </div>
                              </div>
  
                          </div>
                      </div>
                      <div class="">
                          <h5> Saito Chatbox List: </h5>
                          <div class="saito-list  saito-white-background  ">
                              <div class="saito-list-chatbox">
                                  <div class="saito-list-user-image-box">
                                      <img class="saito-identicon" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-user-content-box">
                                      <div class="saito-address">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                                      <p> Hey how are you?</p>
                                  </div>
                                  <div class="saito-list-user-timestamp">
                                      22:00pm
                                  </div>
                              </div>
                              <div class="saito-list-chatbox">
                                  <div class="saito-list-user-image-box">
                                      <img class="saito-identicon" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-user-content-box">
                                      <div class="saito-address">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                                      <p> Hey how are you?</p>
                                  </div>
                                  <div class="saito-list-user-timestamp">
                                      22:00pm
                                  </div>
                              </div>
                              <div class="saito-list-chatbox">
                                  <div>
                                      <img src="/saito/img/background.png" />
                                  </div>
                                  <div>
                                      <div>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                                      <p> Hey how are you?</p>
                                  </div>
                                  <div>
                                      22:00pm
                                  </div>
                              </div>
  
                          </div>
                      </div>
                  </div>
                  <div class="saito-grid-1-1">
                      <div class="">
                          <h5> Saito App List: </h5>
                          <div class="saito-list  saito-white-background ">
                              <div class="saito-list-game">
                                  <div class="saito-list-app-image-box">
                                      <img class="saito-app-image" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-app-content-box">
                                      <div class="saito-app-name">Saitolicious</div>
                                      <p>Tacos, the Saito Network and Saito Consensus</p>
                                  </div>
                                  <div class="saito-list-game-controls">
                                      Report
                                  </div>
                              </div>
                              <div class="saito-list-game">
                                  <div class="saito-list-app-image-box">
                                      <img class="saito-app-image" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-app-content-box">
                                      <div class="saito-app-name">Saitolicious</div>
                                      <p>Tacos, the Saito Network and Saito Consensus</p>
                                  </div>
                                  <div class="saito-list-game-controls">
                                      Report
                                  </div>
                              </div>
                              <div class="saito-list-game">
                                  <div>
                                      <img src="/saito/img/background.png" />
                                  </div>
                                  <div>
                                      <div class="saito-app-name">Saitolicious</div>
                                      <p>Tacos, the Saito Network and Saito Consensus</p>
                                  </div>
                                  <div>
                                      Report
                                  </div>
                              </div>
  
                          </div>
                      </div>
                      <div class="">
                          <h5> Saito App List: </h5>
                          <div class="saito-list  saito-white-background ">
                              <div class="saito-list-game">
                                  <div class="saito-list-app-image-box">
                                      <img class="saito-app-image" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-app-content-box">
                                      <div class="saito-app-name">Saitolicious</div>
                                      <p>Tacos, the Saito Network and Saito Consensus</p>
                                  </div>
                                  <div class="saito-list-game-controls">
                                      Report
                                  </div>
                              </div>
                              <div class="saito-list-game">
                                  <div class="saito-list-app-image-box">
                                      <img class="saito-app-image" src="/saito/img/background.png" />
                                  </div>
                                  <div class="saito-list-app-content-box">
                                      <div class="saito-app-name">Saitolicious</div>
                                      <p>Tacos, the Saito Network and Saito Consensus</p>
                                  </div>
                                  <div class="saito-list-game-controls">
                                      Report
                                  </div>
                              </div>
                              <div class="saito-list-game">
                                  <div>
                                      <img src="/saito/img/background.png" />
                                  </div>
                                  <div>
                                      <div class="saito-app-name">Saitolicious</div>
                                      <p>Tacos, the Saito Network and Saito Consensus</p>
                                  </div>
                                  <div>
                                      Report
                                  </div>
                              </div>
  
                          </div>
                      </div>
  
                  </div>
  
  
              </div>
          </div>
      </div>
  
  
      <div class="saito-tab " id="example1">
  
  
          <div class="saito-sidebar left">
              <div>
                  <div>
                      <div class="saito-menu  ">
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
  
  
              <div>
                  <div>
                      <div class="saito-list  saito-white-background  ">
                          <div class="saito-list-chatbox">
                              <div class="saito-list-user-image-box">
                                  <img class="saito-identicon" src="/saito/img/background.png" />
                              </div>
                              <div class="saito-list-user-content-box">
                                  <div class="saito-address">Saito Community Chat </div>
                                  <p> new chat</p>
                              </div>
                              <div class="saito-list-user-timestamp">
                   
                              </div>
                          </div>
                          <div class="saito-list-chatbox">
                              <div class="saito-list-user-image-box">
                                  <img class="saito-identicon" src="/saito/img/background.png" />
                              </div>
                              <div class="saito-list-user-content-box">
                                  <div class="saito-address">Saito Community Chat </div>
                                  <p> new chat</p>
                              </div>
                              <div class="saito-list-user-timestamp">
                          
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
          </div>
  
          <div class="saito-main">
              <div class="saito-list  saito-white-background ">
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Doom</div>
                          <p> Publisher:t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</p>
                      </div>
                      <div class="saito-list-game-controls">

                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Doom</div>
                          <p> Publisher:t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</p>
                      </div>
                      <div class="saito-list-game-controls">

                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Blackjack</div>
                          <p> Classic casino game with home rules. Try to get closest to 21 without busting, b...</p>
                      </div>
                      <div class="saito-list-game-controls">

                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Chess</div>
                          <p>An implementation of the Chess for the Saito Blockchain</p>
                      </div>
                      <div class="saito-list-game-controls">

                      </div>
                  </div>
              </div>
  
  
          </div>
  
          <div class="chat-container">
              <div>
                  <h6>Community Chat</h6>
                  <i id="chat-container-close" class="fas fa-times"></i>
              </div>
              <div>
                  <div class="chat-dialog">
                  <div class="saito-list  saito-white-background  ">
                  <div class="saito-list-chatbox">
                      <div class="saito-list-user-image-box">
                          <img class="saito-identicon" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-address">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                          <p> Hey how are you?</p>
                      </div>
                      <div class="saito-list-user-timestamp">
                          22:00pm
                      </div>
                  </div>
                  <div class="saito-list-chatbox">
                      <div class="saito-list-user-image-box">
                          <img class="saito-identicon" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-address">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                          <p> Hey how are you?</p>
                      </div>
                      <div class="saito-list-user-timestamp">
                          22:00pm
                      </div>
                  </div>
                  <div class="saito-list-chatbox">
                      <div>
                          <img src="/saito/img/background.png" />
                      </div>
                      <div>
                          <div>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                          <p> Hey how are you?</p>
                      </div>
                      <div>
                          22:00pm
                      </div>
                  </div>

              </div>
                  </div>
              </div>
              <div>
                  <input type="text" placeholder="Type message" />
                  <i id="saito-sendmsg-button" class="fas fa-paper-plane"></i>
              </div>
          </div>
  
      </div>
  
  
  
      <div class="saito-tab " id="example2">
  
  
  
          <div class="saito-sidebar left">
              <div>
                  <div>
                      <div class="saito-menu  ">
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
  
  
              <div>
                  <div>
                      <div class="saito-list  saito-white-background  ">
                          <div class="saito-list-chatbox">
                              <div class="saito-list-user-image-box">
                                  <img class="saito-identicon" src="/saito/img/background.png" />
                              </div>
                              <div class="saito-list-user-content-box">
                                  <div class="saito-address">Saito Community Chat </div>
                                  <p> new chat</p>
                              </div>
                              <div class="saito-list-user-timestamp">
                                 
                              </div>
                          </div>
                          <div class="saito-list-chatbox">
                              <div class="saito-list-user-image-box">
                                  <img class="saito-identicon" src="/saito/img/background.png" />
                              </div>
                              <div class="saito-list-user-content-box">
                                  <div class="saito-address">Saito Community Chat </div>
                                  <p> new chat</p>
                              </div>
                              <div class="saito-list-user-timestamp">
                                 
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
          </div>
  
          <div class="saito-main">
  
              <div class="saito-list  saito-white-background ">
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Doom</div>
                          <p> Publisher:t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Blackjack</div>
                          <p> Classic casino game with home rules. Try to get closest to 21 without busting, b...</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Chess</div>
                          <p>An implementation of the Chess for the Saito Blockchain</p>
                      </div>
                      <div class="saito-list-game-controls">
                        
                      </div>
                  </div>
              </div>
  
  
          </div>
  
          <div class="saito-sidebar right">
              <div class="saito-search-bar">
                  <i class="fas fa-search"></i> <input type="text" placeholder="Search on Saito" />
              </div>
              <div class="saito-calendar-small"></div>
  
          </div>
  
  
      </div>
  
  
  
  
  
      <div class="saito-tab " id="example3">
  
  
  
  
          <div class="saito-main">
  
              <div class="saito-list  saito-white-background ">
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Doom</div>
                          <p> Publisher:t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Blackjack</div>
                          <p> Classic casino game with home rules. Try to get closest to 21 without busting, b...</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Chess</div>
                          <p>An implementation of the Chess for the Saito Blockchain</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
              </div>
  
  
          </div>
  
          <div class="saito-sidebar right">
              <div class="saito-search-bar">
                  <i class="fas fa-search"></i> <input type="text" placeholder="Search on Saito" />
              </div>
              <div class="saito-calendar-small"></div>
  
          </div>
  
  
      </div>
      <div class="saito-tab " id="example4">
  
  
  
          <div class="saito-sidebar left">
              <div class="hamburger">
                  <i class="fas fa-bars"></i>
              </div>
              <div>
  
                  <div>
                      <div class="saito-menu  ">
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
  
  
              <div>
                  <div>
                      <div class="saito-list  saito-white-background  ">
                          <div class="saito-list-chatbox">
                              <div class="saito-list-user-image-box">
                                  <img class="saito-identicon" src="/saito/img/background.png" />
                              </div>
                              <div class="saito-list-user-content-box">
                                  <div class="saito-address">Saito Community Chat </div>
                                  <p> new chat</p>
                              </div>
                              <div class="saito-list-user-timestamp">
                                 
                              </div>
                          </div>
                          <div class="saito-list-chatbox">
                              <div class="saito-list-user-image-box">
                                  <img class="saito-identicon" src="/saito/img/background.png" />
                              </div>
                              <div class="saito-list-user-content-box">
                                  <div class="saito-address">Saito Community Chat </div>
                                  <p> new chat</p>
                              </div>
                              <div class="saito-list-user-timestamp">
                                 
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
          </div>
          <div class="saito-main">
  
              <div class="saito-list  saito-white-background ">
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Doom</div>
                          <p> Publisher:t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Blackjack</div>
                          <p> Classic casino game with home rules. Try to get closest to 21 without busting, b...</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
                  <div class="saito-list-game">
                      <div class="saito-list-app-image-box">
                          <img class="saito-app-image" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-app-content-box">
                          <div class="saito-app-name">Chess</div>
                          <p>An implementation of the Chess for the Saito Blockchain</p>
                      </div>
                      <div class="saito-list-game-controls">
                         
                      </div>
                  </div>
              </div>
  
  
  
  
          </div>
  
          <div class="saito-tab" id="components">
              <div class="saito-overlay">
                  <div class="saito-backdrop">
                      <i  class="close-overlay fas fa-times"> </i>
                      <div>
  
                      </div>
                  </div>
  
              </div>
              <div class="saito-main">
                  <h4 class=""> Components </h4>
                  <div>
                      <button id="salert_button"> salert </button>
                      <button id="sprompt_button"> sprompt </button>
                      <button id="sconfirm_button"> sconfirm </button>
  
                      <button id="sitemsg_button"> siteMessage </button>
                      <button id="changetheme_button"> Change theme </button>
                      <button id="showoverlay_button"> Show overlay </button>
                  </div>
              </div>
          </div>
      </div>
      `;

}