
Quick Notes:

ioquake3.original is the original Quake3 engine as compiled by emscripten. The version offered is modified so that features provided by Saito can work. All modifications are identified / tagged in the source with the phrase HACK so that we can quickly grep through the file and find the lines that have been changed.

 - webGL buffers re-enabled so that canvas supports screenshots
 - event listeners on the keyboard so that other UI components get tweets and chat

CSS:
 - CSS loading needs to happen in the order provided in the index.html FILE, so only the Saito CSS files are in /css subdir



