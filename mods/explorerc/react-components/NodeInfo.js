import React, { useEffect, useState } from 'react';

// Assuming a utility function for formatting balance exists or will be created
// import { formatBalance } from '../web/js/utils'; // Example import
const formatBalance = (balance) => {
    // Basic placeholder formatter - replace with actual Saito formatting logic
    try {
        const num = Number(balance);
        return isNaN(num) ? 'N/A' : num.toLocaleString(); // Simple formatting
    } catch {
        return 'N/A';
    }
};


const NodeInfo = ({ mod }) => { // Only need mod prop for fetching
  const [nodeInfo, setNodeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNodeInfo = async () => {
      if (!mod) {
        setError("Module prop not available");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await mod.fetchNodeInfo();
        setNodeInfo(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching node info:", err);
        setError(err.message || "Failed to load node information");
        setNodeInfo(null); // Clear any stale data
      } finally {
        setIsLoading(false);
      }
    };

    loadNodeInfo();
  }, [mod]); // Re-fetch if mod instance changes (though unlikely)

  if (isLoading) {
    return <div className="node-info-card node-info-loading">Loading Node Info...</div>;
  }

  if (error) {
    return <div className="node-info-card node-info-error">Error: {error}</div>;
  }

  if (!nodeInfo) {
    return <div className="node-info-card node-info-empty">No Node Info available.</div>;
  }

  // Display fetched data
  return (
    <div className="node-info-card">
      <div className="node-info-header">Node Information</div>
      <div className="node-info-body">
         <p><span className="node-info-label">Public Key:</span> <code className="mono-data">{nodeInfo.publicKey || 'N/A'}</code></p>
         <p><span className="node-info-label">Balance:</span> <code className="mono-data">{formatBalance(nodeInfo.balance)} SAITO</code></p>
         <p><span className="node-info-label">Endpoint:</span> <code className="mono-data">{nodeInfo.serverEndpoint || 'N/A'}</code></p>
         <p><span className="node-info-label">Mempool Txs:</span> <code className="mono-data">{nodeInfo.mempoolTxCount ?? 'N/A'}</code></p>
         <p><span className="node-info-label">Latest Block:</span> <code className="mono-data">{nodeInfo.latestBlockId || 'N/A'}</code></p>
      </div>
    </div>
  );
};

export default NodeInfo; 