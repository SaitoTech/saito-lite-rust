# bot-api-nodejs-client

[中文版](./README.zh-CN.md)

The Node.js version of the mixin SDK

## New version features

1. More friendly type and code hints
2. More standardized function naming
3. More comprehensive test coverage

## Install

```shell
npm install mixin-node-sdk
```

If you use `yarn`

```shell
yarn add mixin-node-sdk
```

## Usage

1. Use Mixin API

```js
const { Client } = require('mixin-node-sdk');
const client = new Client({
  client_id: '',
  session_id: '',
  pin_token: '',
  private_key: '',
  pin: '',
  client_secret: '',
});
// Use Promise
client.userMe().then(console.log);

// use async await
async function getMe() {
  const me = await client.userMe();
  console.log(me);
}
```

2. Receive Mixin Messenger messages

```js
const { BlazeClient } = require('mixin-node-sdk');
const client = new BlazeClient(
  {
    client_id: '',
    session_id: '',
    pin_token: '',
    private_key: '',
    pin: '',
    client_secret: '',
  },
  { parse: true, syncAck: true }
);

client.loopBlaze({
  onMessage(msg) {
    console.log(msg);
  },
});
```

> BlazeClient directly inherits Client, so all Client methods BlazeClient can be called directly.

## Note

1. If you are using the version of `mixin-node-sdk@2.xx.xx`, please see [https://github.com/liuzemei/mixin-node-sdk](https://github.com/liuzemei/mixin-node-sdk)

## Contribute

Acceptable PRs.

## Related articles or links

> 1. [https://developers.mixin.one/document](https://developers.mixin.one/document)
> 2. [https://github.com/fox-one/mixin-sdk-go](https://github.com/fox-one/mixin-sdk-go)

## License

```
Copyright 2021 Mixin.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
