const ModTemplate = require('./../../lib/templates/modtemplate');
//const child_process = require('child_process');
const PeerService = require('saito-js/lib/peer_service').default;

class YoutubeServer extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.slug = 'youtube-server';
    this.name = 'youtube-server';
    this.description = 'Server for encoding video for YT stream via ffmpeg with WebSocket';
    this.categories = 'Utilities Communications';
    this.class = 'utility';
    this.publickey = '';
    this.styles = ['/youtube-server/style.css', '/saito/saito.css'];

    return this;
  }

  initialize(app) {
    super.initialize(app);
    if (this.browser_active) {
      this.styles = ['/youtube-server/style.css', '/saito/saito.css'];
    }
    if (this.app.BROWSER == 0) {
    }
  }

  async render() {
    if (!this.browser_active) {
      return;
    }
    let this_mod = this;
  }

  initializeWebSocketServer() {
    const child_process = require('child_process');
    const WebSocketServer = require('ws').Server;
    // const wss = new WebSocketServer({ port: 3000 });

    wss.on('connection', (ws, req) => {
      console.info('yt - on connection fired');
      // Ensure that the URL starts with '/rtmp/', and extract the target RTMP URL.
      let match;
      if (!(match = req.url.match(/^\/rtmp\/(.*)$/))) {
        ws.terminate(); // No match, reject the connection.
        return;
      }

      const rtmpUrl = decodeURIComponent(match[1]);
      console.log('Target RTMP URL:', rtmpUrl);

      // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP.
      // If 'ffmpeg' isn't in your path, specify the full path to the ffmpeg binary.
      const ffmpeg = child_process.spawn('ffmpeg', [
        // FFmpeg will read input video from STDIN
        '-i',
        '-',

        // If we're encoding H.264 in-browser, we can set the video codec to 'copy'
        // so that we don't waste any CPU and quality with unnecessary transcoding.
        // If the browser doesn't support H.264, set the video codec to 'libx264'
        // or similar to transcode it to H.264 here on the server.
        '-vcodec',
        'libx264',

        // AAC audio is required for Live.  No browser currently supports
        // encoding AAC, so we must transcode the audio to AAC here on the server.

        '-ab',
        '128k',

        '-ac',
        '2',

        '-ar',
        '44100',

        '-r',
        '25',

        '-s',
        '720x420',

        '-vb',
        '660k',

        // FLV is the container format used in conjunction with RTMP
        '-f',
        'flv',

        // The output RTMP URL.
        // For debugging, you could set this to a filename like 'test.flv', and play
        // the resulting file with VLC.  Please also read the security considerations
        // later on in this tutorial.
        rtmpUrl
      ]);

      // If FFmpeg stops for any reason, close the WebSocket connection.
      ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
        ws.terminate();
      });

      // Handle STDIN pipe errors by logging to the console.
      // These errors most commonly occur when FFmpeg closes and there is still
      // data to write.  If left unhandled, the server will crash.
      ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
      });

      // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
      ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg STDERR:', data.toString());
      });

      // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
      ws.on('message', (msg) => {
        console.log('DATA', msg);
        ffmpeg.stdin.write(msg);
      });

      // If the client disconnects, stop FFmpeg.
      ws.on('close', (e) => {
        ffmpeg.kill('SIGINT');
      });
    });
  }

  webServer(app, expressapp, express) {
    // this.initializeWebSocketServer();
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
  }

  getWebsocketPath() {
    return 'rtmp';
  }

  onWebSocketServer(wss) {
  	const child_process = require('child_process');
    console.log('youtube on websocket server');
    super.onWebSocketServer(wss);
    wss.on('connection', (ws, req) => {
      console.log('youtube server got connection');
      // Ensure that the URL starts with '/rtmp/', and extract the target RTMP URL.
      let match;

      console.log("rq.url:". req.url);

      if (!(match = req.url.match(/^\/rtmp\/(.*)$/))) {
        console.log('terminating youtube connection');
        ws.terminate(); // No match, reject the connection.
        return;
      }

      const rtmpUrl = decodeURIComponent(match[1]);
      console.log('Target RTMP URL:', rtmpUrl);

      // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP.
      // If 'ffmpeg' isn't in your path, specify the full path to the ffmpeg binary.
      const ffmpeg = child_process.spawn('ffmpeg', [
        // FFmpeg will read input video from STDIN
        '-i',
        '-',

        // If we're encoding H.264 in-browser, we can set the video codec to 'copy'
        // so that we don't waste any CPU and quality with unnecessary transcoding.
        // If the browser doesn't support H.264, set the video codec to 'libx264'
        // or similar to transcode it to H.264 here on the server.
        '-vcodec',
        'libx264',

        // AAC audio is required for Live.  No browser currently supports
        // encoding AAC, so we must transcode the audio to AAC here on the server.

        '-ab',
        '128k',

        '-ac',
        '2',

        '-ar',
        '44100',

        '-r',
        '25',

        '-s',
        '720x420',

        '-vb',
        '660k',

        // FLV is the container format used in conjunction with RTMP
        '-f',
        'flv',

        // The output RTMP URL.
        // For debugging, you could set this to a filename like 'test.flv', and play
        // the resulting file with VLC.  Please also read the security considerations
        // later on in this tutorial.
        rtmpUrl
      ]);

      // If FFmpeg stops for any reason, close the WebSocket connection.
      ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
        ws.terminate();
      });

      // Handle STDIN pipe errors by logging to the console.
      // These errors most commonly occur when FFmpeg closes and there is still
      // data to write.  If left unhandled, the server will crash.
      ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
      });

      // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
      ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg STDERR:', data.toString());
      });

      // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
      ws.on('message', (msg) => {
        console.log('DATA', msg);
        ffmpeg.stdin.write(msg);
      });

      // If the client disconnects, stop FFmpeg.
      ws.on('close', (e) => {
        ffmpeg.kill('SIGINT');
      });
    });
    wss.on('close', (e) => {
      console.log('youtube connection closed : ', e);
    });
    wss.on('error', (e) => {
      console.error(e);
    });
    wss.on('disconnect', (code, signal) => {
      console.log('youtube connection disconnected');
    });
  }
}

module.exports = YoutubeServer;
