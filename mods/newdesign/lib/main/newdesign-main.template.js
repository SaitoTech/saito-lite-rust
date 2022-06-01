

module.exports = (app) => {

  return `

  <div class="saito-container" id="container mb-6">

  <div class="saito-contentbox saito-box-shadow mb-2">
    <h3>h3 - Module header</h3>
  </div>
  <br />

  <h4>Form Items</h4>
  <form class="saito-box saito-box-shadow  saito-box-rounded  saito-white-background saito-mt-2">

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
    <div><input type="checkbox" checked></input><input type="checkbox"></input><input type="checkbox"></input><input
        type="checkbox"></input></div>
    <label>Radio Buttons</label>
    <div><input type="radio" checked></input><input type="radio"></input><input type="radio"></input><input
        type="radio"></input></div>
    <label>Select</label>

    <select class="saito-new-select">
      <option value="0">Select car:</option>
      <option value="1">Audi</option>
      <option value="2">BMW</option>
      <option value="3">Citroen</option>
      <option value="4">Ford</option>
      <option value="5">Honda</option>
      <option value="6">Jaguar</option>
      <option value="7">Land Rover</option>
      <option value="8">Mercedes</option>
      <option value="9">Mini</option>
      <option value="10">Nissan</option>
      <option value="11">Toyota</option>
      <option value="12">Volvo</option>
    </select>


    <label>Text Area</label>
    <textarea placeholder="Text area">
              Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank chicken shankle cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken, boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip meatloaf picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.
          </textarea>
  </form>






  <hr />





  <h4>Pre</h4>
  <pre class="saito-mt-2">
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
  <hr />
  <h4>Buttons </h4>
  <div class="saito-mt-2">
    <button>First</button>
    <button class="saito-btn-secondary">Second</button>
    <button class="saito-btn-small">Small</button>
    <button class="saito-btn-secondary saito-btn-large">Large</button>
  </div>

  <hr />


  <h4>Fieldset</h4>
  <fieldset class="saito-box saito-box-shadow  saito-box-rounded saito-white-background saito-mt-2">

    <h1 class="saito-primary-color">h1 Heading</h1>
    <h2 class="saito-secondary-color">h2 Heading</h2>
    <h3 class="saito-primary-color">h3 Heading</h3>
    <h4>h4 Sub Heading</h4>
    <h5>h4 Sub Heading</h5>
    <h6>h4 Sub Heading</h4>
      <p>Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank chicken shankle
        cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken,
        boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip meatloaf
        picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.

      </p>
  </fieldset>


  <hr />

  <h4>Grid System</h4>
  <div class="saito-mt-2">
    <div class="saito-light-background">
      <div class="row  ">
        <div class="col-1-of-2 saito-p-2">
          <div class="saito-infobox saito-box-rounded saito-box-shadow">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h3 Sub Heading </h3>
            </div>
            <div class="saito-infobox-body">
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora numquam
                accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
                alias hic! </p>

            </div>
            <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>
          </div>
        </div>
        <div class="col-1-of-2 saito-p-2">
          <div class="saito-infobox saito-box-rounded  saito-box-shadow">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h3 Sub Heading </h3>
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

      <div class="row">
        <div class="col-1-of-3  saito-p-2">
          <div class="saito-infobox   saito-box-shadow">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h3 Sub Heading </h3>
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
        <div class="col-1-of-3 saito-p-2">
          <div class="saito-infobox   saito-box-shadow">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h3 Sub Heading </h3>
            </div>
            <div class="saito-infobox-body">
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo </p>


            </div>
            <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>
          </div>
        </div>
        <div class="col-1-of-3 saito-p-2">
          <div class="saito-infobox   saito-box-shadow">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h3 Sub Heading </h3>
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
      <div class="row">
        <div class="col-1-of-2 saito-p-2">
          <div class="saito-contentbox saito-box-shadow">
            <h4 class="saito-primary-color"> h4 Sub heading </h4>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora numquam
              accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
              alias hic! </p>

          </div>
        </div>
        <div class="col-1-of-2 saito-p-2">
          <div class="saito-contentbox saito-box-shadow">
            <h4 class="saito-primary-color">h4 Sub heading</h4>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora numquam
              accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
              alias hic! </p>

          </div>
        </div>
      </div>
    </div>
    <div class="saito-white-background saito-p-1 saito-mt-6">
      <div class="row">
        <div class="col-2-of-4 saito-p-2">
          <div class="saito-infobox saito-box-secondary ">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h3 Sub Heading </h3>
            </div>
            <div class="saito-infobox-body">
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora numquam
                accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
                alias hic! </p>


            </div>
            <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>
          </div>
        </div>
        <div class="col-2-of-4 saito-p-2">
          <div class="saito-infobox  saito-box-secondary ">
            <div class="saito-infobox-title">
              <h4 class="saito-primary-color"> h4 Sub Heading </h4>
              <h3 class="saito-primary-color"> h2 Sub Heading </h3>
            </div>
            <div class="saito-infobox-body">
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex quisquam odio quo. Nisi tempora numquam
                accusamus nam iste reiciendis tempore consequatur incidunt, dignissimos sit odio ipsum iure dolores
                alias hic! </p>


            </div>
            <div class="saito-infobox-footer"> <button class="saito-btn-secondary"> Button </button> </div>
          </div>
        </div>
      </div>
      <div class="row ">
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
        <div class="col-1-of-4 saito-p-2"> Col 1 of 4 </div>
        <div class="col-2-of-4 saito-light-background  saito-p-2"> Col 2 of 4 </div>
      </div>
      <div class="row">
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
        <div class="col-2-of-4 saito-p-2"> Col 2 of 4 </div>
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
      </div>
      <div class="row">
        <div class="col-2-of-4 saito-light-background  saito-p-2"> Col 2 of 4 </div>
        <div class="col-1-of-4 saito-p-2"> Col 1 of 4 </div>
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
      </div>
      <div class="row">
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
        <div class="col-3-of-4 saito-p-2"> Col 3 of 4 </div>

      </div>

      <div class="row">
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
        <div class="col-1-of-4 saito-p-2"> Col 1 of 4 </div>
        <div class="col-1-of-4 saito-light-background  saito-p-2"> Col 1 of 4 </div>
        <div class="col-1-of-4 saito-p-2"> Col 1 of 4 </div>

      </div>
    </div>

  </div>

  <hr />

  <h4>Menus</h4>
  <div class="saito-mt-2">
    <div class="row">
      <div class="col-1-of-3 saito-p-3">
        <div class="saito-menu-container saito-py-2">
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
      <div class="col-1-of-3 saito-p-3">
        <div class="saito-menu-container saito-menu-right saito-py-2">
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
      <div class="col-1-of-3 saito-p-3 ">
        <div class="saito-menu-container saito-menu-right saito-py-2">
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
    <div class="row">
      <div class="col-1-of-3 saito-p-3">
        <div class="saito-menu-container  saito-menu-rounded saito-py-2">
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
      <div class="col-1-of-3 saito-p-3">
        <div class="saito-menu-container saito-menu-right saito-menu-rounded  saito-py-2">
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
      <div class="col-1-of-3 saito-p-3 ">
        <div class="saito-menu-container  saito-menu-right saito-menu-rounded saito-py-2">
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
  </div>
</div>




  `;

}



//   2-1-1, 1-2-1, 1-1-2.