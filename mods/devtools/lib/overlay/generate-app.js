const GenerateAppOverlayTemplate = require('./generate-app.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class GenerateAppOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.mod_details = {};
		this.zip_file = null;
	}

	render() {
		this.overlay.show(GenerateAppOverlayTemplate(this.app, this.mod, this));
		this.overlay.blockClose();
		this.attachEvents();
	}

	attachEvents() {
		try {
			let this_self = this;

			document.querySelector('#saito-app-generate-btn').onclick = async (e) => {

				document.querySelector('#saito-app-generate-btn').innerHTML = 'Generating app, please wait...';
				document.querySelector('#saito-app-generate-btn').classList.add("active");

				await this_self.mod.sendSubmitModuleTransaction(this_self.zip_file, this_self.mod_details.slug, async function(res){
			    	console.log('mod details: ', res);
			 		
			 		let obj = {
				      module: "Appstore",
				      request: "submit application",
				      bin: res.DYN_MOD_WEB,
				      name: this_self.mod_details.name,
				      description: this_self.mod_details.description,
				      slug: this_self.mod_details.slug,
				      image: this_self.mod_details.image,
				      version: this_self.mod_details.version,
				      publisher: this_self.mod.publicKey,
				      categories: this_self.mod_details.categories
				    };

					let newtx = await this_self.app.wallet.createUnsignedTransaction(this_self.publicKey, BigInt(0), BigInt(0));
					newtx.msg = obj;

					let jsonData = newtx.serialize_to_web(this_self.app);
					this_self.mod.download(JSON.stringify(jsonData), `${this_self.mod_details.slug}.saito`, "text/plain", function(){
						this_self.overlay.close();
					});   

				});
			}
		} catch(err) {
			console.error("Error: ", err);
			salert("An error occurred while compiling application. Check console for details.");
		}
	}
}

module.exports = GenerateAppOverlay;
