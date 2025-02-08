module.exports = (app, mod) => {

	let html = `
	    <div class="atr-add-mempool-overlay">
            <label>Fee</label>
            <input value="0" id="fee">
            <!--
            <label>Inputs</label>
            <input value="" id="inputs">
            <label>Outputs</label>
            <input value="" id="outputs">
            -->
            <button class="saito-button-primary add_transaction" id="add_transaction">Add Transaction</button>
        </div>

        <style>
            .atr-add-mempool-overlay {
                background-color: #fff;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .atr-add-mempool-overlay input {
                height: 4rem;
                width: 40rem;
                padding: 0.5rem;
                font-size: 1.6rem;
            }

            .add_transaction {
                font-size: 1.6rem;
                border-radius: 6px;
                cursor: pointer;
                width: max-content;
                align-self: flex-end;
            }
        </style>
	`;

	return html;
}
