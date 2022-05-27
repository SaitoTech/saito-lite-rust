

module.exports = (app) => {

  return `

  <div class="saito-container" id="container">
  <h3>h3 - Module header</h3>

  <h4>Form Items</h4>
  <form class="saito-white-background">
    
      <h4 >Title</h4>
      <p>This is a row of plain text.</p>
      <label>Password</label>
      <div><input id="password" type="password" placeholder="This is a password field" class="password" /></div>
      <label>Text Input</label>
      <div><input placeholder="Text Field" type="text" ></input></div>
      <label>Date Input</label>
      <div><input type="text" name="datepicker"></input></div>
      <label>Range Input</label>
      <div><input type="range" value="8"></input></div>
      <label>Checkboxes</label>
      <div><input type="checkbox" checked></input><input type="checkbox"></input><input type="checkbox"></input><input type="checkbox"></input></div>
      <label>Radio Buttons</label>
      <div><input type="radio" checked></input><input type="radio"></input><input type="radio"></input><input type="radio"></input></div>
      <label>Select</label>

      <select>
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

  

  


<hr/>
 




<h4>Pre</h4>
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
<hr/>
<h4>Buttons </h4>
<button>First</button>
<button class="saito-btn-secondary">Second</button>
<button class="saito-btn-small">Small</button>
<button class="saito-btn-secondary saito-btn-large">Large</button>

<hr/>


<h4>Fieldset</h4>
<fieldset class="saito-white-background">

    <h1 class="saito-primary-color">h1 Heading</h1>
    <h2 class="saito-secondary-color">h2 Heading</h2>
    <h3 class="saito-primary-color">h3 Heading</h3>
    <h4>h4 Sub Heading</h4>
    <h5>h4 Sub Heading</h5>
    <h6>h4 Sub Heading</h4>    
    <p>Bacon ipsum dolor amet meatloaf ribeye pork loin corned beef strip steak filet mignon shank chicken shankle cupim hamburger bacon kielbasa biltong. Alcatra pork belly ball tip kielbasa t-bone drumstick turducken, boudin porchetta landjaeger. Short ribs chuck frankfurter pork belly spare ribs meatloaf. Pig tri-tip meatloaf picanha, sirloin strip steak shoulder cow porchetta pork chop filet mignon swine burgdoggen bacon.

    </p>    
</fieldset>


</div>

  `;

}

