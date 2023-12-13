module.exports = (app, mod) => {
  return `
    

<!DOCTYPE html>
<html lang="en" data-theme="dark">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  
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


  <meta name="twitter:card" content="${mod.social.twitter_card}" />
  <meta name="twitter:site" content="${mod.social.twitter_site}" />
  <meta name="twitter:creator" content="${mod.social.twitter_creator}" />
  <meta name="twitter:title" content="${mod.social.twitter_title}" />
  <meta name="twitter:url" content="${mod.social.twitter_url}" />
  <meta name="twitter:description" content="${mod.social.twitter_description}" />
  <meta name="twitter:image" content="${mod.social.twitter_image}" />

  <meta property="og:title" content="${mod.social.og_title}" />
  <meta property="og:url" content="${mod.social.og_url}" />
  <meta property="og:type" content="${mod.social.og_type}" />
  <meta property="og:description" content="${mod.social.og_description}" />
  <meta property="og:site_name" content="${mod.social.og_site_name}" />
  <meta property="og:image" content="${mod.social.og_image}" />
  <meta property="og:image:url" content="${mod.social.og_image_url}" />
  <meta property="og:image:secure_url" content="${mod.social.og_image_secure_url}" />

  <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
  <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
  <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />

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
      z-index: 16; /*saito-header has z-index:15 */
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      height: 100vh;
      width: 100vw;
      /* hardcode bg colors used because saito-variables arent accessible here */
      background-color: #211f25; 
      background-image: url('/saito/img/tiled-logo.svg');
      transition: all 1s ease-in-out;
      -webkit-transition: all 1s ease-in-out;
    }
  </style>
</head>

<body>

</body>
<script id="saito" type="text/javascript" src="/redsquare/tweets.0.js?x=${new Date().getTime()}"></script>
<script id="saito" type="text/javascript" src="/redsquare/tweets.1.js?x=${new Date().getTime()}"></script>
<script id="saito" type="text/javascript" src="/redsquare/tweets.2.js?x=${new Date().getTime()}"></script>
<script id="saito" type="text/javascript" src="/redsquare/tweets.3.js?x=${new Date().getTime()}"></script>
<script id="saito" type="text/javascript" src="/redsquare/tweets.4.js?x=${new Date().getTime()}"></script>
<script type="text/javascript", src="/saito/saito.js?version=${JSON.stringify(
    app.options.wallet.version
  )}&build=${JSON.stringify(app.wallet.build_number) || "defaultBuild"}">
</script>
</html>

`;
};
