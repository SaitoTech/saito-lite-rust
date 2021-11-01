# `markdown-linkify`

Turn plain URLs in text into Markdown links. Works in the browser and on the server.

## Usage

1. Input:  `"Made by folks from https://spectrum.chat"`
2. Output: `"Made by folks from [https://spectrum.chat](https://spectrum.chat)"`

```javascript
const linkify = require('markdown-linkify');

const text = 'Made by folks from https://spectrum.chat'
const linked = linkify(text);

console.log(linked)
// -> 'Made by folks from [https://spectrum.chat](http://spectrum.chat)'
```

We use [`linkify-it`](http://npm.im/linkify-it) to detect URLs which supports major TLDs without protocol (`google.com`, `facebook.net` etc) and everything that uses a protocol. (e.g. `https://bla.bullshit`, `mailto:hi@spectrum.chat`) We err on the side of being certain and not-linkifying rather than over-linkifying.

## Installation

```sh
npm install --save markdown-linkify
# or if you have yarn installed
yarn add markdown-linkify
```

## License

Licensed under the MIT License, Copyright ©️ 2017 Maximilian Stoiber. See [LICENSE.md](LICENSE.md) for more information.
