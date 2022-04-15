module.exports = StakingAppspaceTemplate = (app) => {

  let html = `

  <div class="email-appspace-settings">

    <h2>Staking Slips</h2>

    <p></p>

    Your available balance is: <div class="staking_available_balance" id="staking_available_balance"></div>
    <br />
    Your staked balance is: <div class="staked_balance" id="staked_balance"></div>

    <p></p>

    <h2>Deposit</h2>

    <input type="text" id="submit_stake_input" class="submit_stake_input" />

    <p></p>

    <input type="button" class="submit_stake_button" id="submit_stake_button" />

    <p></p>

    The wallet should keep track of staked UTXO separately from spendable UTXO, pulling them out of the 
    wallet to ensure they are not casually spent, and displaying them here along with their status to 
    provide users with visibility into the state of UTXO which have been submitted or are pending.

  </div>
  `;

  return html;

}

