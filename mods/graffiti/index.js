module.exports = (app, slug, lastSnapshotPath, isFirstTime) => {
  const title = "Saito Graffiti";

  let snapshotMetaTags = "";
  if (lastSnapshotPath !== null) {
    const origin = "https://saito.io";
    const lastSnapshotURL = `${origin}/${slug}/${lastSnapshotPath}`;

    snapshotMetaTags += `
      <meta property="og:type"             content="website" />
      <meta property="og:url"              content="${origin}/${slug}" />
      <meta property="og:title"            content="🟥 ${title}" />
      <meta property="og:site_name"        content="🟥 ${title}" />
      <meta property="og:image"            content="${lastSnapshotURL}" />
      <meta property="og:image:url"        content="${lastSnapshotURL}" />
      <meta property="og:image:secure_url" content="${lastSnapshotURL}" />
  
      <meta name="twitter:card"    content="summary_large_image" />
      <meta name="twitter:url"     content="${origin}/${slug}" />
      <meta name="twitter:title"   content="🟥 ${title}" />
      <meta name="twitter:site"    content="@SaitoOfficial" />
      <meta name="twitter:creator" content="@SaitoOfficial" />
      <meta name="twitter:image"   content="${lastSnapshotURL}" />
    `;
  }

  return `
    <!doctype html>
    <html lang="en" prefix="og: http://ogp.me/ns#">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="">

        ${snapshotMetaTags}

        <title>${title}</title>
        
        <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
    
        <link rel="stylesheet" type="text/css" href="/saito/saito.css" />
        <link rel="stylesheet" type="text/css" href="/saito/game.css" />
        <link rel="stylesheet" type="text/css" href="/graffiti/shepherd.css" />

        <link rel="icon" media="all" type="image/x-icon" href="/favicon.ico?v=2"/>
      </head>

      <body>
        <script>window.isFirstTime = ${isFirstTime};</script>
        <script id="saito" type="text/javascript" src="/saito/saito.js?build=${app.build_number}"></script>
      </body>
    </html>
  `;
}