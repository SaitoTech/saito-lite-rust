module.exports = (app, mod, build_number) => {
  return `

  
  <!DOCTYPE html>
  <html lang="en" data-theme="dark">
  
  <head>

    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="description" content="Saito Network" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=yes" />
  
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
  
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="saito.io arcade" />
    <meta name="apple-mobile-web-app-title" content="Saito Arcade" />
    <meta name="theme-color" content="#FFFFFF" />
    <meta name="msapplication-navbutton-color" content="#FFFFFF" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="msapplication-starturl" content="/index.html" />
  
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@SaitoOfficial" />
    <meta name="twitter:creator" content="@dlancashi" />
  
  
  
    <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
    <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
    <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
  
    <title>Saito Arcade</title>
  
    <script type="text/javascript" src="/saito/lib/jquery/jquery-3.2.1.min.js"></script>
  
    <title>Saito Arcade</title>

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
  
  </body>
  <script type="text/javascript" src="/saito/saito.js?build=${build_number}" >
</script>
  </html>
  
  `;
};
