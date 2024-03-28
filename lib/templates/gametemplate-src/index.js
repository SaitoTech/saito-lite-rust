module.exports = (app, mod, build_number, og_card) => {
	return `

  
  <!DOCTYPE html>
  <html lang="en" data-theme="lite">
  
  <head>

    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="description" content="${mod.description}" />
    <meta name="keywords" content="${mod.categories}"/>
    <meta name="author" content="${og_card.creator}"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
  
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="${mod.returnTitle()}" />
    <meta name="apple-mobile-web-app-title" content="${mod.returnTitle()}" />
    <meta name="theme-color" content="#FFFFFF" />
    <meta name="msapplication-navbutton-color" content="#FFFFFF" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="msapplication-starturl" content="/index.html" />
  
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="${og_card.twitter}" />
    <meta name="twitter:creator" content="${og_card.creator}" />
    <meta name="twitter:title" content="${og_card.title}" />
    <meta name="twitter:url" content="${og_card.url}" />
    <meta name="twitter:description" content="${og_card.description}" />
    <meta name="twitter:image" content="${og_card.image}" />
  
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${og_card.title}" />
    <meta property="og:url" content="${og_card.url}" />
    <meta property="og:description" content="${og_card.description}"/>
    <meta property="og:site_name" content="${og_card.title}" />
    <meta property="og:image" content="${og_card.image}"/>
    <meta property="og:image:url" content="${og_card.image}"/>
    <meta property="og:image:secure_url" content="${og_card.image}"/>
  
    <link rel="icon" media="all"  type="image/x-icon"  href="/favicon.ico?v=2"/>
    <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
    <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png" />
    <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png" />

    <script type="text/javascript" src="/saito/lib/jquery/jquery-3.2.1.min.js"></script>
    <script type="text/javascript" src="/saito/lib/jquery/jquery-ui.min.js"></script>
    <!--script src="/saito/lib/pace/pace.min.js"></script>
    <link rel="stylesheet" href="/saito/lib/pace/pace-theme.min.css"-->
    
    <link rel="stylesheet" type="text/css" href="/saito/lib/jquery/jquery-ui.min.css" media="screen"/>

    <link rel="stylesheet" type="text/css" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" media="screen"/>
    <link rel="stylesheet" type="text/css" href="/saito/lib/font-awesome-6/css/all.css" media="screen"/>


    <link rel="stylesheet" type="text/css" href="/saito/saito.css?v=${build_number}" />
    <link rel="stylesheet" type="text/css" href="/saito/game.css?v=${build_number}" />
    <link rel="stylesheet" type="text/css" href="/${mod.returnSlug()}/style.css?v=${build_number}" />


    <title>${mod.returnTitle()}</title>
  
    <script type="text/javascript" src="/saito/saito.js?build=${build_number}" async></script>
  
  </head>
  
  <body>
    ${mod.returnDefaultHTML()}
  </body>
  
  </html>
  
  `;
};
