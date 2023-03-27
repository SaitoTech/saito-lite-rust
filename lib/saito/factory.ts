import SaitoFactory from "saito-js/lib/factory";
import Block from "./block";
import Peer from "./peer";
import Slip from "./slip";
import Transaction from "./transaction";

export default class Factory extends SaitoFactory {
  constructor() {
    super();
  }

  public createBlock(data?: any): Block {
    return new Block(data);
  }

  public createTransaction(data?: any): Transaction {
    return new Transaction(data);
  }

  public createSlip(data?: any): Slip {
    return new Slip(data);
  }

  public createPeer(data?: any): Peer {
    return new Peer(data);
  }
}
