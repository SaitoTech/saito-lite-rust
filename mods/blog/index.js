module.exports = (app, mod, build_number, og_card) => {
	return `

  
  <!DOCTYPE html>
  <html lang="en" data-theme="dark">
  
  <head>

    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <meta name="description" content="${app.browser.escapeHTML(mod.description)}" />
    <meta name="keywords" content="${mod.categories}"/>
    <meta name="author" content="Saito"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=yes" />
  
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
  
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="saito.io blog" />
    <meta name="apple-mobile-web-app-title" content="Saito Blog" />
    <meta name="theme-color" content="#FFFFFF" />
    <meta name="msapplication-navbutton-color" content="#FFFFFF" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="msapplication-starturl" content="/index.html" />
  
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="${og_card.twitter}" />
    <meta name="twitter:creator" content="${og_card.twitter}" />
    <meta name="twitter:title" content="${app.browser.escapeHTML(og_card.title)}" />
    <meta name="twitter:url" content="${og_card.url}" />
    <meta name="twitter:description" content="${app.browser.escapeHTML(og_card.description)}" />
    <meta name="twitter:image" content="${og_card.image}" />
  
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${app.browser.escapeHTML(og_card.title)}" />
    <meta property="og:url" content="${og_card.url}" />
    <meta property="og:description" content="${app.browser.escapeHTML(og_card.description)}"/>
    <meta property="og:site_name" content="${app.browser.escapeHTML(og_card.title)}" />
    <meta property="og:image" content="${og_card.image}"/>
    <meta property="og:image:url" content="${og_card.image}"/>
    <meta property="og:image:secure_url" content="${og_card.image}"/>
  
    <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
    <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
    <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
  
    <script type="text/javascript" src="/saito/lib/jquery/jquery-3.2.1.min.js"></script>
  
    <script data-pace-options='{ "restartOnRequestAfter" : false, "restartOnPushState" : false}' src="/saito/lib/pace/pace.min.js"></script>
    <link rel="stylesheet" href="/saito/lib/pace/center-atom.css">
    <link rel="stylesheet" type="text/css" href="/saito/saito.css?v=${build_number}">
    
    <title>Saito Blog</title>
  
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
      z-index: 160;
      /*saito-header has z-index:15 */
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      height: 100vh;
      width: 100vw;
      /* hardcode bg colors used because saito-variables arent accessible here */
      background-color: #180c24;
      background-image: url('/saito/img/tiled-logo.svg');
    }
  </style>


  </head>
  
  <body>
  <script src="/blog/js/quill.js"></script>
  https://cdn.jsdelivr.net/npm/quill-markdown-shortcuts@0.0.10/dist/markdownShortcuts.min.js
  </body>
  <script type="text/javascript" src="/saito/saito.js?build=${build_number}" >
</script>
  </html>
  
  `;
};
