module.exports = (app, mod, build_number) => {
  let html = `

<!DOCTYPE html>
<html lang="zh" class=""><head>
<head>

  <meta name="description" content="${app.browser.escapeHTML(mod.description)}" />
  <meta name="keywords" content="${mod.categories}"/>

  <meta charset="utf-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

  <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
  <link rel="stylesheet" href="/saito/lib/jquery/jquery-ui.min.css" type="text/css" media="screen" />
  <link rel="stylesheet" href="/saito/saito.css" type="text/css" media="screen" />

  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="application-name" content="saito.io popup" />
  <meta name="apple-mobile-web-app-title" content="Popup Chinese" />
  <meta name="theme-color" content="#FFFFFF" />
  <meta name="msapplication-navbutton-color" content="#FFFFFF" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="msapplication-starturl" content="/index.html" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@SaitoOfficial" />
  <meta name="twitter:creator" content="@SaitoOfficial" />
  <meta name="twitter:title" content="Saito - Enabling a paradigm shift in blockchain applications" />
  <meta name="twitter:url" content="https://saito.tech/" />
  <meta name="twitter:description" content="Saito RedSquare - Web3 Social." />
  <meta name="twitter:image" content="https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png" />

  <meta property="og:title" content="Popup Chinese" />
  <meta property="og:url" content="https://saito.io/popup" />
  <meta property="og:type" content="website" />
  <meta property="og:description" content="Peer to peer social and more" />
  <meta property="og:site_name" content="Popup Chinese" />
  <meta property="og:image" content="https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png" />
  <meta property="og:image:url" content="https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png" />
  <meta property="og:image:secure_url" content="https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png" />

  <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
  <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
  <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />

  <title>Popup Chinese</title>
</head>

<body style="">
  <div id="adso_status"></div>
  <div id="adso_tooltip"></div>
</body>

<script id="saito" type="text/javascript" src="/saito/lib/jquery/jquery-3.2.1.min.js"></script>
<script id="saito" type="text/javascript" src="/saito/lib/jquery/jquery-ui.min.js"></script>
<script type="text/javascript" src="/popup/js/adso.js"></script>
<script type="text/javascript" src="/popup/js/display.js"></script>
<script type="text/javascript" src="/popup/js/user.js"></script>
<script type="text/javascript" src="/popup/js/review.js"></script>
<script id="saito" type="text/javascript" src="/saito/saito.js"></script>

</html>
`;
  return html;
}

