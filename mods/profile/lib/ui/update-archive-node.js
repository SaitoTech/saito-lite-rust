const UpdateArchiveNodeTemplate = require('./update-archive-node.template');
const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader');

class UpdateArchiveNode {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);
        this.loader = new SaitoLoader(
            this.app,
            this.mod,
            '.saito-overlay-form'
        );
        this.archiveNodes = [];
    }

    validateHost(host) {
        const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-\.]{0,61}[a-zA-Z0-9])?$/;
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        
        if (!host) return { valid: false, error: 'Host cannot be empty' };
        
        if (host === 'localhost' || ipv4Regex.test(host) || hostnameRegex.test(host)) {
            return { valid: true };
        }
        
        return { valid: false, error: 'Invalid host format. Please enter a valid hostname or IP address.' };
    }

    validatePort(port) {
        const portNum = parseInt(port);
        if (!port) return { valid: false, error: 'Port cannot be empty' };
        if (isNaN(portNum)) return { valid: false, error: 'Port must be a number' };
        if (portNum < 1 || portNum > 65535) return { valid: false, error: 'Port must be between 1 and 65535' };
        return { valid: true };
    }

    validatePublicKey(publicKey) {
        if (!publicKey) return { valid: false, error: 'Public key cannot be empty' };
        
        try {
            if (!this.app.crypto.isPublicKey(publicKey)) {
                return { valid: false, error: 'Invalid Saito public key format' };
            }
            return { valid: true };
        } catch (error) {
            console.error("Error validating public key:", error);
            return { valid: false, error: 'Error validating public key' };
        }
    }

    validateNodeEntry(nodeEntry, showAlert = false) {
        const hostInput = nodeEntry.querySelector('.node-host');
        const portInput = nodeEntry.querySelector('.node-port');
        const publicKeyInput = nodeEntry.querySelector('.node-public-key');
        
        const hostValidation = this.validateHost(hostInput.value);
        const portValidation = this.validatePort(portInput.value);
        const publicKeyValidation = this.validatePublicKey(publicKeyInput.value);

        let errors = [];
        let isValid = true;

        if (!hostValidation.valid) {
            errors.push(`Host: ${hostValidation.error}`);
            hostInput.classList.add('error');
            isValid = false;
        } else {
            hostInput.classList.remove('error');
        }

        if (!portValidation.valid) {
            errors.push(`Port: ${portValidation.error}`);
            portInput.classList.add('error');
            isValid = false;
        } else {
            portInput.classList.remove('error');
        }

        if (!publicKeyValidation.valid) {
            errors.push(`Public Key: ${publicKeyValidation.error}`);
            publicKeyInput.classList.add('error');
            isValid = false;
        } else {
            publicKeyInput.classList.remove('error');
        }

        if (!isValid && showAlert) {
            salert(`Please fix the following errors:\n\n${errors.join('\n')}`);
        }

        return isValid;
    }

    render(archiveNodes = []) {
        this.archiveNodes = archiveNodes;
        this.overlay.show(UpdateArchiveNodeTemplate(this.archiveNodes));
        this.attachEvents();
    }

    attachEvents() {
        document.querySelector('.add-more-nodes').onclick = (e) => {
            e.preventDefault();
            this.archiveNodes.push({ host: '', port: '', publicKey: '' });
            this.overlay.show(UpdateArchiveNodeTemplate(this.archiveNodes));
            this.attachEvents();
        };

        document.querySelectorAll('.remove-node').forEach((btn, index) => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (this.archiveNodes.length > 1) {
                    this.archiveNodes.splice(index, 1);
                    this.overlay.show(UpdateArchiveNodeTemplate(this.archiveNodes));
                    this.attachEvents();
                } else {
                    salert('You must have at least one archive node.');
                }
            };
        });

        document.querySelector('.saito-overlay-form-submit').onclick = (e) => {
            e.preventDefault();
            const nodes = [];
            let isValid = true;
            
            document.querySelectorAll('.archive-node-entry').forEach((nodeEntry, index) => {
                if (!this.validateNodeEntry(nodeEntry, true)) {
                    isValid = false;
                    salert(`Invalid entries in Archive Node ${index + 1}`);
                    return;
                }

                const host = nodeEntry.querySelector('.node-host').value;
                const port = nodeEntry.querySelector('.node-port').value;
                const publicKey = nodeEntry.querySelector('.node-public-key').value;
                
                nodes.push({ host, port, publicKey });
            });

            if (isValid && nodes.length) {
                this.mod.updateArchiveNodes(nodes);
                salert('Archive nodes updated successfully', 'success');
                this.overlay.remove();
            } else if (nodes.length === 0) {
                salert('Please add at least one archive node.');
            }
        };
    }
}

module.exports = UpdateArchiveNode;