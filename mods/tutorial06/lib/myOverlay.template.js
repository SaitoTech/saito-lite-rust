module.exports = MyOverlayTemplate = (app, mod) => {

	return `
  <style>
    .box {
      border: 3px dotted;
      width: 100%;
      margin: auto;
      text-align: center;
      font-size: 2.2rem;
      padding: 15rem 0rem;
    }
  </style>

    <div class="saito-overlay-form saito-app-overlay" id="saito-app-overlay">
      <h1> Tutorial 6 </h1>
      <p> My application overlay </p>
    </div>
  `;
};