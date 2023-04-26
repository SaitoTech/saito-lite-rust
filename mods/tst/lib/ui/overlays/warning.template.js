module.exports = WarningOverlayTemplate = (address="") => {

  return `
    <div id="dot-warning" class="dot-warning">
      <div id="dot-warning-header" class="dot-warning-header">TST Activated</div>
      <div id="dot-warning-body" class="dot-warning-body">
 	<p style="margin-bottom:20px"></p>
	Fund your Saito wallet at this TST address:
	<p style="margin-bottom:20px"></p>
	<b>${address}</b>
	<p style="margin-bottom:20px"></p>
	Please note that Saito is under development. To minimize risk, make sure your wallet is backed-up with a strong password, and avoid depositing more than you can afford to lose.
        </div>
        <div id="dot-warning-confirm" class="dot-warning-confirm saito-button-primary">Backup and Continue</div>
      </div>
      <style>
.dot-warning {
  background-image: url(/saito/img/dreamscape.png);
  background-size: cover;
  width: 80vw;
  max-height: 80vh;
  max-width: 750px;
  padding: 30px;
}
.dot-warning-header {
  font-size: 3rem;
  text-transform: uppercase;
  font-weight: bold;
  padding: 5px;
}
.dot-warning-body {
  padding: 20px;
  background: #0005;
  line-height: 3rem;
  font-size: 2rem;
}
.dot-warning-confirm {
  max-width: 275px;
  font-size: 1.2em;
  margin-top: 20px;
  text-align: center;
  background: whitesmoke;
  color: var(--saito-red);
  border: 1px solid var(--saito-red);
}
      </style>
    `;
}

