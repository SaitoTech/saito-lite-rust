import User from './user'
import Util from './util'
import Client from './client'

const mixin = {
  user: new User(),
  util: new Util(),
  client: new Client(),
}

export default mixin;
