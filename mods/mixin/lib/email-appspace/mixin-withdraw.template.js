module.exports = MixinWithdrawTemplate = (app) => {

  let html = `

  <div class="email-appspace-withdraw-overlay">
    <div class="withdraw_title">Withdrawl ETH</div>
    <div class="withdraw_desc">Please make sure that you enter a FTX Token address below. Entering any other address will result in the loss of your funds. These funds will be sent over the Ethereum network (L1).</div>
    <div class="amount_label">amount:</div>
    <div class="withdraw_amount">0</div>
    <div class="withdraw_label">withdrawal address</div>
    <div class="withdraw_address">0x4bcfbe16bed40f2d79891c85383b6556d3a60437</div>
  </div>

<style>
.email-appspace-withdraw-overlay {
}
.withdraw_title {
}
.withdraw_desc {
}
.withdraw_label {
}
.withdraw_address {
}
  </style>

  `;

  return html;

}

