const saito = require('../../lib/saito/saito');
const DiddyMain = require('./lib/main');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class Diddy extends ModTemplate {
    constructor(app) {
        super(app);

        this.app = app;
        this.name = 'Diddy';
        this.slug = 'diddy';

        this.description = 'Module that creates a root website on a Saito node.';
        this.categories = 'Utilities Communications';
        this.class = 'utility';

        // Add energy and timestamp to the persistent state
        this.diddy = { count: 0, level: 1, energy: 40, maxEnergy: 40, rechargeRate: 0.2, lastUpdated: Date.now() };
        this.ui = null;

        return this;
    }

    async initialize(app) {
        await super.initialize(app);

        // console.log("Initializing Diddy module...");

        // Load persistent state
        this.load();

        // Update energy based on elapsed time
        this.updateEnergyFromElapsedTime();

        // Ensure dynamic properties are recalculated
        this.recalculateState();

        if (this.browser_active){
            // Initialize components
            this.ui = new DiddyMain(app, this);
            this.header = new SaitoHeader(app, this);

            // Add components to the app
            this.addComponent(this.ui);
            this.addComponent(this.header);
        }
    }

    recalculateState() {
        const count = this.diddy.count;

        // Formula to calculate level based on count
        let level = 1;
        while (count >= 20 * level * level + 20 * level) {
            level++;
        }

        // Update level
        const previousLevel = this.diddy.level;
        this.diddy.level = level;

        // Update maxEnergy and rechargeRate based on level
        this.diddy.maxEnergy = 40 + (level - 1) * 15; // Start at 40, scale more moderately
        this.diddy.rechargeRate = 0.2 + (level - 1) * 0.07; // Start slightly faster, scale with level

        // If the user levels up, ensure energy is capped at the new maxEnergy
        if (previousLevel !== level) {
            this.diddy.energy = Math.min(this.diddy.energy, this.diddy.maxEnergy);
        }

        // console.log(
        //     `Recalculated state: Count = ${count}, Level = ${level}, Max Energy = ${this.diddy.maxEnergy}, Recharge Rate = ${this.diddy.rechargeRate}, Energy = ${this.diddy.energy}`
        // );
    }

    updateEnergyFromElapsedTime() {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - this.diddy.lastUpdated) / 1000);

        if (elapsedSeconds > 0) {
            // Calculate recharged energy
            const rechargedEnergy = Math.floor(elapsedSeconds * this.diddy.rechargeRate);
            this.diddy.energy = Math.min(this.diddy.energy + rechargedEnergy, this.diddy.maxEnergy);

            // console.log(`Recovered ${rechargedEnergy} energy from ${elapsedSeconds} seconds.`);
        }

        // Update lastUpdated timestamp
        this.diddy.lastUpdated = now;
        this.save();
    }

    save() {
        // Save count, level, energy, maxEnergy, and lastUpdated to persistent storage
        // console.log("Saving state:", this.diddy);
        this.app.options.diddy = this.diddy;
        this.app.storage.saveOptions();
    }

    load() {
        // console.log("Loading state...");
        if (this.app.options.diddy) {
            this.diddy = this.app.options.diddy; // Load the saved state

            // Ensure values are initialized properly
            if (this.diddy.energy === undefined || isNaN(this.diddy.energy)) this.diddy.energy = 40;
            if (this.diddy.maxEnergy === undefined || isNaN(this.diddy.maxEnergy)) this.diddy.maxEnergy = 40;
            if (this.diddy.rechargeRate === undefined || isNaN(this.diddy.rechargeRate)) this.diddy.rechargeRate = 0.2;
            if (this.diddy.lastUpdated === undefined || isNaN(this.diddy.lastUpdated)) this.diddy.lastUpdated = Date.now();
        } else {
            // Default state - Fresh start
            this.diddy = { count: 0, level: 1, energy: 40, maxEnergy: 40, rechargeRate: 0.2, lastUpdated: Date.now() };
        }

        // console.log(`Loaded state: ${JSON.stringify(this.diddy)}`);
    }

    incrementTap() {
        this.diddy.count += 1;
        this.recalculateState();
        // console.log("Updated state:", this.diddy);
        this.save(); // Save the new state
    }

    async createClickTransaction() {
        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
        newtx.msg = {
            module: this.name,
            request: "click",
        };
        await newtx.sign();
        return newtx;
    }

    async onConfirmation(blk, tx, conf) {
        let diddy_mod = this.app.modules.returnModule(this.name);
        let txmsg = tx.returnMessage();

        if (conf == 0) {
            if (txmsg.module === this.name) {
                if (txmsg.request === 'click') {
                    this.receiveClickTransaction(tx);
                    try {
                        let publickey = tx.from[0].publicKey;
                        diddy_mod.addOrUpdateRecords(publickey);
                    } catch (err) {
                        // console.log("Database Issues: " + JSON.stringify(err));
                    }
                }
            }
        }
    }

    receiveClickTransaction(tx) {
        // console.log("# Received Click Transaction:", tx.returnMessage());
    }

    async addOrUpdateRecords(publickey = '', count = 0) {
        let sql, params, res;

        // Insert if the record doesn't exist
        sql = `INSERT OR IGNORE INTO records (publickey) VALUES ($publickey)`;
        params = { $publickey: publickey };
        res = await this.app.storage.runDatabase(sql, params, 'diddy');

        // Then update
        sql = `UPDATE records SET count = count + 1 WHERE publickey LIKE BINARY "$publickey"`;
        params = { $publickey: publickey };
        res = await this.app.storage.runDatabase(sql, params, 'diddy');
    }
}

module.exports = Diddy;
