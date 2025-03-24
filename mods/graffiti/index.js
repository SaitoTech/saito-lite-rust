module.exports = (app) => {
  const title = "Saito Graffiti";

  return `
    <!doctype html>
    <html lang="en" prefix="og: http://ogp.me/ns#">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">

        <title>${title}</title>

        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" media="all">
        
        <link rel="stylesheet" type="text/css" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" media="screen">
        <link rel="stylesheet" type="text/css" href="/saito/lib/font-awesome-6/css/all.css" media="screen">

        <link rel="stylesheet" type="text/css" href="style.css" media="screen">
      </head>

      <body class="wait-cursor">
        <main>
          <div id="logo-title" class="non-display side-column">
            <img id="logo" src="img/saito-logo.svg" alt="saito-logo">
            <div id="title" class="text">${title}</div>
          </div>

          <div id="top-bar" class="non-display">
            <div id="controls-segment" class="bar-segment"></div>
            <div id="tools-segment"    class="bar-segment"></div>
            <div id="wallet-segment"   class="bar-segment"></div>
          </div>

          <div id="side-panel" class="non-display">
            <div id="color-subpanel" class="side-column subpanel">
              <div id="saturation-value-adjuster" class="pointer">
                <div id="saturation-value-spectrum">
                  <div id="saturation-value-spectrum-hue-layer"   class="saturation-value-spectrum-layer"></div>
                  <div id="saturation-value-spectrum-white-layer" class="saturation-value-spectrum-layer"></div>
                  <div id="saturation-value-spectrum-black-layer" class="saturation-value-spectrum-layer"></div>
                </div>

                <div id="saturation-value-handle" class="handle color-handle grab"></div>
              </div>

              <div id="hue-picker-container">
                <div id="hue-adjuster" class="pointer">
                  <div id="hue-spectrum"></div>
                  <div id="hue-handle" class="handle color-handle grab"></div>
                </div>

                <button id="color-picker-button">
                  <i id="color-picker-icon" class="fas fa-eye-dropper"></i>
                </button>
              </div>
            </div>
          </div>

          <div id="display-area">
            <div id="loader">
              <div id="spinner1" class="spinner"></div>
              <div id="spinner2" class="spinner"></div>
              <div id="spinner3" class="spinner"></div>
            </div>
            <div id="board"></div>
            <canvas id="selection-canvas"></canvas>
          </div>
        </main>

        <script type="module" src="main.js"></script>
        <script id="saito" src="/saito/saito.js?build=${app.build_number}"></script>
      </body>
    </html>
  `;
};