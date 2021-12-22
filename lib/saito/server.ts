import { Saito } from "../../apps/core";

class Server {
  public app: Saito;

  constructor(app) {
    this.app = app || {};
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {}
}

export default Server;
