import React, { useState } from 'react';
import TransactionCard from './TransactionCard';

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    // Timestamp might be in seconds or milliseconds, check magnitude
    const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    const date = new Date(ts);

    // Manual formatting
    const year = date.getFullYear();
    // getMonth() is 0-indexed, add 1
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;

  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return 'Invalid Date';
  }
};

const BlockCard = ({ block, mod, onAddressClick, onBlockHashClick }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [isTxListVisible, setIsTxListVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txListStatus, setTxListStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleCopy = async (textToCopy, fieldName) => {
    if (!navigator.clipboard) {
      // Clipboard API not available (e.g., insecure context)
      console.error('Clipboard API not available.');
      setCopySuccess(`Failed: Clipboard unavailable`);
      setTimeout(() => setCopySuccess(''), 1500);
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      console.log(`${fieldName} copied to clipboard:`, textToCopy);
      setCopySuccess(`${fieldName} Copied!`);
      setTimeout(() => setCopySuccess(''), 1500); // Clear feedback after 1.5s
    } catch (err) {
      console.error(`Failed to copy ${fieldName}: `, err);
      setCopySuccess(`Failed to copy ${fieldName}`);
       setTimeout(() => setCopySuccess(''), 1500);
    }
  };

  // Function to fetch block data (including transactions) from the unified endpoint
  const fetchBlockData = async () => {
    // Check only for hash
    if (!block || !block.hash) { 
        console.error("Cannot fetch block data: block hash is missing.", block);
        setError("Block data incomplete, cannot load transactions.");
        setTxListStatus('error');
        return;
    }
    
    // Use hash for the API call
    const hash = block.hash;
    console.log(`BlockCard: Fetching full block data via UNIFIED /api/block/${hash}`); 
    setTxListStatus('loading');
    setError(''); // Clear previous errors
    try {
      const modName = "explorerc"; 
      // Use the UNIFIED endpoint with the hash
      const response = await fetch(`/${modName}/api/block/${hash}`); 
      if (!response.ok) {
        let errorText = `HTTP error! status: ${response.status}`;
        try { 
            const errorData = await response.json(); 
            errorText = `${errorText} - ${errorData.message || 'Unknown server error'}`;
        } catch (e) { 
             errorText = `${errorText} - ${await response.text() || 'Could not retrieve error details'}`;
        } 
        throw new Error(errorText);
      }
      // The response body is the full block JSON data (already combined by the server)
      const fullBlockData = await response.json(); 
      
      console.log("BlockCard: Fetched Combined Block Data:", fullBlockData);

      // Check if transactions array exists directly in the fetched data
      if (fullBlockData && Array.isArray(fullBlockData.transactions)) {
          setTransactions(fullBlockData.transactions);
          setTxListStatus('success');
      } else {
          console.warn("Transactions array not found or not an array in fetched block data.");
          setTransactions([]); 
          setTxListStatus('success'); // Treat as success with no transactions found
      }

    } catch (error) {
      console.error("Error fetching combined block data:", error);
      setError(error.message || "Failed to load transaction details.");
      setTxListStatus('error');
      setTransactions([]);
    }
  };

  // Function to toggle transaction list visibility
  const toggleTxListVisibility = () => {
    const becomingVisible = !isTxListVisible;
    setIsTxListVisible(becomingVisible);

    // Fetch data only when expanding for the first time AND there are transactions expected
    // OR if data has already been loaded/attempted (txListStatus !== 'idle')
    if (becomingVisible && (block.transactionCount > 0 || txListStatus !== 'idle') && txListStatus === 'idle') {
      fetchBlockData();
    }
  };

  // Function to handle clicking the refresh icon when txnCount is 0 initially
  const handleRefreshTransactions = () => {
    console.log("BlockCard: Refresh transactions clicked (txnCount was 0)");
    if (txListStatus === 'idle') {
        fetchBlockData(); // Start fetching data
        setIsTxListVisible(true); // Expand the list area immediately
    } else {
        // If already loaded/error, just toggle visibility
        toggleTxListVisibility();
    }
  };

  console.log("BlockCard component rendered with block:", block);
  if (!block) {
    return <div className="block-card block-card-empty">No block data available.</div>;
  }

  // Use the dedicated transactionCount field from the API response
  const txnCount = block.transactionCount ?? 0;
  // Ensure ID is displayed correctly (convert BigInt to string for display)
  const displayId = block.id !== undefined && block.id !== null ? block.id.toString() : 'N/A';
  const hash = block.hash ?? 'N/A';
  const prevHash = block.previousBlockHash ?? 'N/A';
  const creator = block.creator ?? 'N/A';
  const isCreatorClickable = onAddressClick && creator && creator !== 'N/A';
  const isHashClickable = onBlockHashClick && hash && hash !== 'N/A';
  const isPrevHashClickable = onBlockHashClick && prevHash && prevHash !== 'N/A'; // Check if prevHash is clickable

  // Function to handle creator click
  const handleCreatorClick = (e) => {
    e.preventDefault(); // Prevent default if it were a link
    e.stopPropagation(); // Prevent triggering other clicks if nested
    if (isCreatorClickable) {
      onAddressClick(creator);
    }
  };

  // Function to handle hash click
  const handleHashClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHashClickable) {
      onBlockHashClick(hash);
    }
  };

  // Function to handle previous hash click
  const handlePrevHashClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isPrevHashClickable) {
          onBlockHashClick(prevHash);
      }
  };

  // Determine which footer UI to show. Show refresh only if initial count is 0 AND we haven't tried loading yet.
  const showRefreshForTx = txnCount === 0 && txListStatus === 'idle';
  // Determine the count to display when the expander is shown
  const displayTxnCount = txListStatus === 'success' ? transactions.length : txnCount;

  return (
    <div className={`block-card ${block.longestChain ? 'on-longest-chain' : ''}`}>
      <div className="block-card-header">
        {/* Left side: Block ID */}
        <div className="block-header-id">
          Block ID: <span className="mono-data">{displayId}</span>
        </div>
        {/* Right side: Indicators */}
        <div className="block-header-indicators">
          {block.longestChain && (
            <span className="indicator indicator-chain" title="On Longest Chain">
              {/* Heroicon - link (outline) */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </span>
          )}
          {block.goldenTicket && (
            <span className="indicator indicator-gt" title="Golden Ticket">
              {/* Heroicon - ticket (outline) */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v-1.5a3.375 3.375 0 0 0-3.375-3.375h-1.5a3.375 3.375 0 0 0-3.375 3.375v1.5m5.25 0a3 3 0 0 1-3 3h-1.5a3 3 0 0 1-3-3v-1.5m5.25 0V19.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25V6.75m5.25 0H10.5" />
              </svg>
            </span>
          )}
          <span className="indicator indicator-difficulty" title={`Difficulty: ${block.difficulty}`}>D:{block.difficulty}</span>
          <span className="indicator indicator-burnfee" title={`Burn Fee: ${block.burnFee}`}>B:{block.burnFee}</span>
        </div>
      </div>
      <div className="block-card-body">
        <p className="block-data-row">
          <span className="block-card-label">Hash:</span> 
          <span className="data-copy-container">
            {/* Make hash clickable */}
            <code 
              className={`mono-data truncate ${isHashClickable ? 'clickable-hash' : ''}`}
              onClick={isHashClickable ? handleHashClick : undefined}
              style={isHashClickable ? { cursor: 'pointer' } : {}}
              title={isHashClickable ? `View details for block ${hash}` : hash}
            >
              {hash}
            </code>
            {hash !== 'N/A' && 
              <span className="copy-icon" title="Copy Hash" onClick={(e) => {e.stopPropagation(); handleCopy(hash, 'Hash');}}>
                {/* Heroicon - clipboard (outline) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              </span>}
          </span>
        </p>
        <p className="block-data-row">
          <span className="block-card-label">Previous Hash:</span> 
           <span className="data-copy-container">
             {/* Make prevHash clickable */}
             <code 
               className={`mono-data truncate ${isPrevHashClickable ? 'clickable-hash' : ''}`} // Reuse clickable-hash style
               onClick={isPrevHashClickable ? handlePrevHashClick : undefined}
               style={isPrevHashClickable ? { cursor: 'pointer' } : {}}
               title={isPrevHashClickable ? `View details for block ${prevHash}` : prevHash}
              >
                 {prevHash}
             </code>
            {prevHash !== 'N/A' && 
              <span className="copy-icon" title="Copy Previous Hash" onClick={(e) => { e.stopPropagation(); handleCopy(prevHash, 'Previous Hash'); }}> {/* Add stopPropagation */} 
                {/* Heroicon - clipboard (outline) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              </span>}
          </span>
        </p>
        <p className="block-data-row">
          <span className="block-card-label">Creator:</span> 
           <span className="data-copy-container">
            <code 
              className={`mono-data truncate ${isCreatorClickable ? 'clickable-address' : ''}`}
              onClick={isCreatorClickable ? handleCreatorClick : undefined}
              style={isCreatorClickable ? { cursor: 'pointer' } : {}}
              title={isCreatorClickable ? `View details for ${creator}` : creator}
            >
              {creator}
            </code>
            {creator !== 'N/A' && 
              <span className="copy-icon" title="Copy Creator" onClick={(e) => {e.stopPropagation(); handleCopy(creator, 'Creator');}}>
                {/* Heroicon - clipboard (outline) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              </span>}
          </span>
        </p>
        <p className="block-data-row">
          <span className="block-card-label">Timestamp:</span> 
          <code className="mono-data truncate">{formatTimestamp(block.timestamp)}</code>
        </p>
      </div>
      <div className="block-card-footer">
        {/* Choose footer content based on state */} 
        {showRefreshForTx ? (
          // Show Refresh icon if txnCount is 0 and data not loaded
          <div className="tx-refresh-container" onClick={handleRefreshTransactions} style={{ cursor: 'pointer' }}>
             <span>transactions</span> 
             <span 
                className="indicator indicator-refresh" // Use same classes as NodeInfo refresh
                title="Load Transaction Data"
             >
                {/* Heroicon - ArrowPathIcon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
             </span>
          </div>
        ) : (
          // Show Expander icon and count otherwise
          <div className="tx-toggle-container" onClick={toggleTxListVisibility} style={{ cursor: 'pointer' }}>
            <span className={`tx-toggle-icon ${isTxListVisible ? 'expanded' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Transactions: {displayTxnCount}</span>
          </div>
        )}
        
        {copySuccess && <span className="copy-feedback">{copySuccess}</span>}
      </div>
      {/* Conditionally rendered transaction list */}
      {isTxListVisible && (
        <div className="block-card-tx-list">
          {txListStatus === 'loading' && <p>Loading transactions...</p>}
          {txListStatus === 'error' && <p>Error loading transactions.</p>}
          {txListStatus === 'success' && (
            transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <TransactionCard 
                  key={tx.signature || index} 
                  tx={tx} 
                  index={index} 
                  onAddressClick={onAddressClick} 
                />
              ))
            ) : (
              <p>No transactions in this block.</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default BlockCard; 