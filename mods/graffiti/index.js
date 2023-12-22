module.exports = (app, mod, build_number, currentGridImageURL) => {
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="">
        

        <meta property="og:url"              content="https://saito.io/graffiti" />
        <meta property="og:title"            content="🟥 Saito Graffiti" />
        <meta property="og:type"             content="website" />
        <meta property="og:description"      content="Saito Graffiti" />
        <meta property="og:site_name"        content="🟥 Saito Graffiti" />
        <meta property="og:image"            content="${currentGridImageURL}" />
        <meta property="og:image:url"        content="${currentGridImageURL}" />
        <meta property="og:image:secure_url" content="${currentGridImageURL}" />



        <meta name="twitter:url"     content="https://saito.io/graffiti" />
        <meta name="twitter:title"   content="🟥 Saito Graffiti" />
        <meta name="twitter:card"    content="summary_large_image" />
        <meta name="twitter:site"    content="@SaitoOfficial" />
        <meta name="twitter:creator" content="@SaitoOfficial" />
        <meta name="twitter:image"   content="${currentGridImageURL}" />


        <title>Saito Graffiti</title>
    
        <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
    
        <link rel="stylesheet" type="text/css" href="/saito/saito.css" />
        <link rel="stylesheet" type="text/css" href="/saito/game.css" />
    
        <link rel="icon" media="all" type="image/x-icon" href="/favicon.ico?v=2"/>
      </head>
    
      <body>
        <script id="saito" type="text/javascript" src="/saito/saito.js?build=${build_number}"></script>
      </body>
    </html>`;
  return html;
};