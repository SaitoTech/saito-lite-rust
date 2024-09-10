module.exports = (app, mod, build_number, og_card, recent_tweets = []) => {
	let html = `

<!DOCTYPE html>
<html lang="en" data-theme="dark">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  
  <meta name="description" content="${app.browser.escapeHTML(mod.description)}" />
  <meta name="keywords" content="${mod.categories}"/>
  <meta name="author" content="Saito 🟥"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=yes" />

  <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
  
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="application-name" content="saito.io redsquare" />
  <meta name="apple-mobile-web-app-title" content="🟥 Saito P2P RedSquare" />
  <meta name="theme-color" content="#FFFFFF" />
  <meta name="msapplication-navbutton-color" content="#FFFFFF" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="msapplication-starturl" content="/index.html" />


  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="${og_card.twitter}" />
  <meta name="twitter:creator" content="${og_card.twitter}" />
  <meta name="twitter:title" content="${og_card.title}" />
  <meta name="twitter:url" content="${og_card.url}" />
  <meta name="twitter:description" content="${app.browser.escapeHTML(og_card.description)}" />
  <meta name="twitter:image" content="${og_card.image}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${og_card.title}" />
  <meta property="og:url" content="${og_card.url}" />
  <meta property="og:description" content="${app.browser.escapeHTML(og_card.description)}"/>
  <meta property="og:site_name" content="${og_card.title}" />
  <meta property="og:image" content="${og_card.image}"/>
  <meta property="og:image:url" content="${og_card.image}"/>
  <meta property="og:image:secure_url" content="${og_card.image}"/>

  <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
  <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
  <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />

  <script src="/saito/lib/pace/pace.min.js"></script>
  <link rel="stylesheet" href="/saito/lib/pace/pace-theme.min.css">

  <title>Saito RedSquare</title>

  <style type="text/css">
    /* css for fade-out bg effect while content is loading */
    body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    body::before {
      content: "";
      opacity: 1;
      z-index: 160; /*saito-header has z-index:15 */
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      height: 100vh;
      width: 100vw;
      /* hardcode bg colors used because saito-variables arent accessible here */
      background-color: #211f25; 
      background-image: url('/saito/img/tiled-logo.svg');
    }


    .saito-welcome-overlay {
      width: 800px;
      max-width: 90vw;
      height: 600px;
      max-height: 90vh;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-image: url('/saito/img/backgrounds/red_cube_dark.jpg');
      background-size: cover;
      background-position: center;
      z-index: 10000;
      filter: drop-shadow(15px 15px 10px black);
      color: white;
      font-family: initial !important;
      font-weight: 400;
      line-height: 1.2;
    }

    .saito-welcome-overlay-backdrop {
      width: 100vw;
      height: 100vh;
      position: fixed;
      z-index: 10000;
    }

    .saito-welcome-header {
      font-size: 60px;
      color: white;
      text-align: center;
      margin: 30px auto;
    }

    .saito-welcome-footer {
      font-size: 30px;
      position: absolute;
      bottom: 10px;
      padding: 10px;
      text-align: right;
      width: 100%;
    }

    .saito-welcome-overlay ~ .saito-container {
      filter: blur(5px);
    }

  </style>
</head>

<body>

  <div class="saito-welcome-overlay-backdrop"></div>
  <div class='saito-welcome-overlay'>
   <div class='saito-welcome-header'>Installing Saito Wallet...</div>
   <div class='saito-welcome-footer'></div>
  </div>


</body>`;

	html += `<script type="text/javascript">
  if (!tweets) { 
    var tweets = [];
  }`;

	for (let tweet of recent_tweets) {
		html += ` tweets.push(\`${tweet}\`);`;
	}
	html += `</script>

<script type="text/javascript" src="/saito/saito.js?build=${build_number}"></script>
</html>`;

	return html;
};
