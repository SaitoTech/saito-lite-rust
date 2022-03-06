module.exports = MixinDepositTemplate = (app) => {

  let html = `

  <div class="email-appspace-deposit-overlay">
    <div class="deposit_title">Deposit ETH</div>
    <div class="deposit_desc">Only FTX Token should be sent to this address over the Ethereum network (L1)! Sending any other coins may result in the loss of your deposit.</div>
    <div class="deposit_label">ETH deposit address</div>
    <div class="deposit_address">0x4bcfbe16bed40f2d79891c85383b6556d3a60437</div>
  </div>

<style>
.email-appspace-deposit-overlay {
}
.deposit_title {
}
.deposit_desc {
}
.deposit_label {
}
.deposit_address {
}
  </style>

  `;

  return html;

}

