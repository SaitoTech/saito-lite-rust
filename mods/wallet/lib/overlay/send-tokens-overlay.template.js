module.exports = SendTokensOverlayTemplate = () => {
	return `
    <form id="wallet-send-tokens-form" action="" method="POST">
      <div class="wallet-send-tokens-overlay" id="wallet-send-tokens-overlay">

        <label for="wallet-send-tokens-recipient" class="wallet-label">send to address:</label>
        <br />
        <input type="text" id="wallet-send-tokens-recipient" class="wallet-send-tokens-recipient" required>
        <br />
        <label for="wallet-send-tokens-amount" class="wallet-label">amount:</label> 
        <br />
        <input type="number" min="0" step="0.00000001" id="wallet-send-tokens-amount" class="wallet-send-tokens-amount" required>
        <input id="wallet-send-tokens-submit-btn" class="button wallet-send-tokens-submit-btn" type="submit" value="send" >

      </div>
    </form>
    <style>
.wallet-label {
  clear:both;
  margin-top: 20px;
}
.wallet-send-tokens-overlay {
  color: black;
  padding: 40px;
  background-color: whitesmoke;
  width: 590px;
  min-width: 50vw;
}
.wallet-send-tokens-recipient {
  clear: both;
  font-size: 1.6em;
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
}
.wallet-send-tokens-amount {
  clear: both;
  clear: both;
  font-size: 1.6em;
  width: 200px;
  padding: 8px;
  max-width: 100%;
  margin-bottom: 20px;
}
.wallet-send-tokens-submit-btn {
  clear: both;
  width: 200px;
  text-align: center;
  font-size: 1.35em;
}
    </style>
  `;
};
