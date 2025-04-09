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

// Accept app and onRefreshBlocksRequest props
const NodeInfo = ({ app, mod, onRefreshBlocksRequest }) => {
  const [nodeInfo, setNodeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Local state for dynamic block ID display
  const [displayLatestBlockId, setDisplayLatestBlockId] = useState(null);
  // State for refresh icon visibility
  const [showRefreshIcon, setShowRefreshIcon] = useState(false);

  // Fetch initial node info
  useEffect(() => {
    const loadNodeInfo = async () => {
      if (!mod) {
        setError("Module prop not available");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setShowRefreshIcon(false); // Hide initially
      try {
        const data = await mod.fetchNodeInfo();
        setNodeInfo(data);
        const initialLatestId = data?.latestBlockId || null;
        setDisplayLatestBlockId(initialLatestId); 
        // Don't show refresh initially, only when a *newer* block arrives
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

  // Listener for new blocks (using custom event)
  useEffect(() => {
    if (!app?.connection) return;
    
    const handleNewBlockId = (blockIdString) => {
      console.log('NodeInfo: Received explorerc-new-block-id event, ID:', blockIdString);
      // Only show refresh icon if the new ID is different from the current display
      if (blockIdString && blockIdString !== displayLatestBlockId) {
           setDisplayLatestBlockId(blockIdString || null);
           setShowRefreshIcon(true); // Show refresh icon as new blocks are available
      }
    };

    console.log('NodeInfo: Attaching explorerc-new-block-id listener');
    app.connection.on('explorerc-new-block-id', handleNewBlockId);
    return () => {
      console.log('NodeInfo: Detaching explorerc-new-block-id listener');
      app.connection.removeListener('explorerc-new-block-id', handleNewBlockId);
    };
  // }, [app.connection]); // Dependency array needs displayLatestBlockId too
  }, [app?.connection, displayLatestBlockId]); // Re-attach if connection or displayed ID changes

  // Handler for clicking the refresh icon
  const handleRefreshClick = () => {
      if (onRefreshBlocksRequest) {
          setShowRefreshIcon(false); // Hide icon immediately
          onRefreshBlocksRequest(); // Call the handler passed from App.js
      }
  };

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
      <div className="node-info-body two-column">
         <div className="node-info-column">
            <p>
                <span className="node-info-label">Public Key:</span> 
                <code 
                    className="mono-data truncate" 
                    title={nodeInfo.publicKey || 'N/A'}
                >
                    {nodeInfo.publicKey || 'N/A'}
                </code>
            </p>
            <p><span className="node-info-label">Balance:</span> <code className="mono-data">{formatBalance(nodeInfo.balance)} SAITO</code></p>
         </div>
         <div className="node-info-column">
            <p className="latest-block-row">
               <span className="node-info-label">Latest Block:</span> 
               <code className={`mono-data ${showRefreshIcon ? 'has-updates' : ''}`}>
                  {displayLatestBlockId || 'N/A'}
               </code>
               {/* Use Heroicon Refresh Icon - styled as an indicator */}
               {onRefreshBlocksRequest && showRefreshIcon && (
                 <span 
                    className="indicator indicator-refresh" // Use indicator classes
                    onClick={handleRefreshClick} 
                    title="Refresh Block List"
                    style={{ cursor: 'pointer' }} // Add cursor pointer directly
                  >
                   {/* Heroicon - ArrowPathIcon */}
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                   </svg>
                 </span>
               )}
            </p>
            <p><span className="node-info-label">Mempool Txs:</span> <code className="mono-data">{nodeInfo.mempoolTxCount ?? 'N/A'}</code></p>
         </div>
      </div>
    </div>
  );
};

export default NodeInfo; 