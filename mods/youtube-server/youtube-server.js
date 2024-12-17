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

  async initialize(app) {
    await super.initialize(app);
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

    wss.on('connection', (ws, req) => {
      console.info('yt - on connection fired');
      let match;
      if (!(match = req.url.match(/^\/rtmp\/(.*)$/))) {
        console.log("aaa terminating...");
        ws.terminate(); 
        return;
      }

      const rtmpUrl = decodeURIComponent(match[1]);
      console.log('Target RTMP URL:', rtmpUrl);

      const ffmpeg = child_process.spawn('ffmpeg', [
        '-i', '-',

        '-vcodec', 'libx264',

        '-b:a', '160k',

        '-ab', '128k',

        '-ac', '2',

        '-af', "adelay=1|1",

        '-async', '1',

        '-c:a', 'aac',

        '-ar', '44100',

        '-r', '25',

        '-s', '1920x1080',

        '-vb', '660k',

        '-f', 'flv',
        rtmpUrl
      ]);

      ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
        ws.terminate();
      });

      ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg STDERR:', data.toString());
      });

      ws.on('message', (msg) => {
        console.log('DATA', msg);
        ffmpeg.stdin.write(msg);
      });

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
    return 'encoder';
  }

  async onWebSocketServer(wss) {
    const child_process = require('child_process');
    console.log('youtube on websocket server');
    await super.onWebSocketServer(wss);
    wss.on('connection', (ws, req) => {
      console.log('youtube server got connection');
      let match;

      let rtmp_url = (req.url).split("url=")[1];
      console.log("wss request url:", rtmp_url);

      if (rtmp_url == null) {
        console.log('terminating youtube connection');
        ws.terminate();
        return;
      }

      const rtmpUrl = decodeURIComponent(rtmp_url);
      console.log('Target RTMP URL:', rtmpUrl);

      const ffmpeg = child_process.spawn('ffmpeg', [
        '-thread_queue_size', '4096',
        '-i', '-',

        '-vcodec', 'libx264',
        '-preset', 'veryfast',
        '-bufsize', '12000k',   
        '-maxrate', '6000k',     
        '-b:v', '4500k',         
        '-g', '60',
        '-r', '30',
        '-s', '1920x1080',

        // Audio settings
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ar', '44100',
        '-ac', '2',

        // Output format
        '-f', 'flv',
        rtmpUrl
      ]);

      ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
        ws.terminate();
      });

  
      ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg STDERR:', data.toString());
      });

      ws.on('message', (msg) => {
        console.log('Buffer size:', msg.length);
        console.log('Time:', new Date().toISOString());
        ffmpeg.stdin.write(msg);
      });

      ws.on('close', (e) => {
        console.log("youtube server socket closed");
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
    wss.on('terminate', (code, signal) => {
      console.log('terminating youtube connection');
    })
  }
  // async onWebSocketServer(wss) {
  //   const child_process = require('child_process');
  //   console.log('youtube on websocket server');
  //   await super.onWebSocketServer(wss);

  //   wss.on('connection', (ws, req) => {
  //     console.log('youtube server got connection');

  //     let rtmp_url = (req.url).split("url=")[1];
  //     if (!rtmp_url) {
  //       console.log('terminating youtube connection - no RTMP URL');
  //       ws.terminate();
  //       return;
  //     }

  //     const rtmpUrl = decodeURIComponent(rtmp_url);
  //     console.log('Target RTMP URL:', rtmpUrl);

  //     // Modified FFmpeg configuration for better stability
  //     const ffmpeg = child_process.spawn('ffmpeg', [
  //       // Input options must come before the input
  //       '-thread_queue_size', '4096',
  //       '-i', '-',

  //       // Output options come after the input
  //       '-vcodec', 'libx264',
  //       '-preset', 'veryfast',
  //       '-b:v', '4500k',
  //       '-maxrate', '4500k',
  //       '-bufsize', '9000k',
  //       '-g', '60',
  //       '-r', '30',
  //       '-s', '1920x1080',

  //       // Audio settings
  //       '-c:a', 'aac',
  //       '-b:a', '160k',
  //       '-ar', '44100',
  //       '-ac', '2',

  //       // Output format
  //       '-f', 'flv',
  //       rtmpUrl
  //     ]);

  //     // Enhanced error handling and logging
  //     let bufferWarnings = 0;
  //     const MAX_BUFFER_WARNINGS = 5;

  //     ffmpeg.stderr.on('data', (data) => {
  //       const output = data.toString();
  //       console.log('FFmpeg:', output);

  //       // Monitor for specific issues
  //       if (output.includes('buffer underflow')) {
  //         bufferWarnings++;
  //         if (bufferWarnings >= MAX_BUFFER_WARNINGS) {
  //           console.log('Too many buffer warnings, restarting FFmpeg...');
  //           ffmpeg.kill('SIGINT');
  //           bufferWarnings = 0;
  //         }
  //       }
  //     });

  //     // Improved message handling
  //     ws.on('message', (msg) => {
  //       try {
  //         if (!ffmpeg.stdin.write(msg)) {
  //           // If write returns false, pause sending until drain
  //           ws.pause();
  //           ffmpeg.stdin.once('drain', () => {
  //             ws.resume();
  //           });
  //         }
  //       } catch (error) {
  //         console.error('Error writing to FFmpeg:', error);
  //       }
  //     });

  //     // Clean shutdown handling
  //     const cleanup = () => {
  //       console.log('Cleaning up FFmpeg process...');
  //       try {
  //         ffmpeg.stdin.end();
  //         ffmpeg.kill('SIGINT');
  //       } catch (error) {
  //         console.error('Error during cleanup:', error);
  //       }
  //     };

  //     ws.on('close', cleanup);
  //     ws.on('error', (error) => {
  //       console.error('WebSocket error:', error);
  //       cleanup();
  //     });

  //     ffmpeg.on('close', (code, signal) => {
  //       console.log(`FFmpeg closed with code ${code} and signal ${signal}`);
  //       ws.terminate();
  //     });
  //   });
  // }
}

module.exports = YoutubeServer;
