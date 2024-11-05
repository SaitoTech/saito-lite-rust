module.exports = (archiveNodes) => {
    const generateNodeInputs = (nodes) => {
        return nodes.map((node, index) => `
            <div class="archive-node-entry">
                <div class="node-header">
                    <h5>Archive Node ${index + 1}</h5>
                    ${nodes.length > 1 ? 
                        `<button class="remove-node saito-button-secondary">Remove</button>` 
                        : ''}
                </div>
                <div class="node-inputs">
                    <input 
                        type="text" 
                        class="node-host saito-overlay-form-input" 
                        placeholder="Host (e.g., 127.0.0.1)" 
                        value="${node.host || ''}"
                    />
                    <input 
                        type="text" 
                        class="node-port saito-overlay-form-input" 
                        placeholder="Port (e.g., 12101)" 
                        value="${node.port || ''}"
                    />
                    <input 
                        type="text" 
                        class="node-public-key saito-overlay-form-input" 
                        placeholder="Public Key" 
                        value="${node.publicKey || ''}"
                    />
                </div>
            </div>
        `).join('');
    };

    return `
        <form>
            <div class="saito-overlay-form archive-nodes-form">
                <div class="saito-overlay-form-header">
                    <div class="saito-overlay-form-header-title">Add Archive Node</div>
                </div>
                
                <div class="archive-nodes-wrapper">
                    <div class="archive-nodes-container">
                        ${generateNodeInputs(archiveNodes)}
                    </div>

                    <div class="form-actions">
                        <button class="add-more-nodes saito-button-secondary">
                            + Add Node
                        </button>
                    </div>
                </div>

                <div class="saito-overlay-form-submitline">
                    <button 
                        type="submit" 
                        class="saito-button-primary fat saito-overlay-form-submit" 
                        id="saito-overlay-submit"
                    >Save Archive Nodes</button>
                </div>
            </div>
        </form>

    `;
};