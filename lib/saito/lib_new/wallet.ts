import Transaction from "./transaction";
import Saito from "saito-js/dist/saito";

export default class Wallet {
  public async createUnsignedTransactionWithDefaultFee(
    publickey = "",
    amount = BigInt(0)
  ): Promise<Transaction> {
    if (publickey == "") {
      publickey = await this.getPublicKey();
    }
    return this.createUnsignedTransaction(publickey, amount, BigInt(0));
  }

  public async createUnsignedTransaction(
    publicKey = "",
    amount = BigInt(0),
    fee = BigInt(0),
    force_merge = false
  ): Promise<Transaction> {
    return Saito.getInstance().createTransaction(publicKey, amount, fee, force_merge);
  }

  public async signTransaction(tx: Transaction) {
    return Saito.getInstance().signTransaction(tx);
  }

  public async getPublicKey(): Promise<string> {
    return Saito.getInstance().getPublicKey();
  }

  public async getPendingTransactions(): Promise<Array<Transaction>> {
    return Saito.getInstance().getPendingTransactions();
  }

  public async signAndEncryptTransaction(tx: Transaction) {
    return Saito.getInstance().signAndEncryptTransaction(tx);
  }

  public async getBalance(ticker = "SAITO"): Promise<bigint> {
    if (ticker === "SAITO") {
      return Saito.getInstance().getBalance();
    }
    return BigInt(0);
  }
}
