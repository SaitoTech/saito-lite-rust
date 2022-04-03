module.exports = StakingAppspaceTemplate = (app) => {

  let html = `

  <div class="email-appspace-settings">

    <h2>Staking Slips</h2>

    <p></p>

    The wallet should keep track of staked UTXO separately from spendable UTXO, pulling them out of the 
    wallet to ensure they are not casually spent, and displaying them here along with their status to 
    provide users with visibility into the state of UTXO which have been submitted or are pending.

  </div>
  `;

  return html;

}

