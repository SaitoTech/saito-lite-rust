import React from 'react';

// Helper function to format timestamp (consider moving to utils.js later)
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    // Timestamp might be in seconds or milliseconds, check magnitude
    const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    return new Date(ts).toLocaleString();
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return 'Invalid Date';
  }
};

const BlockCard = ({ block }) => {
  console.log("BlockCard component rendered with block:", block);
  if (!block) {
    return <div className="block-card block-card-empty">No block data available.</div>;
  }

  // Use the dedicated transactionCount field from the API response
  const txnCount = block.transactionCount ?? 0;
  // Ensure ID is displayed correctly (convert BigInt to string for display)
  const displayId = block.id !== undefined && block.id !== null ? block.id.toString() : 'N/A';

  return (
    <div className="block-card">
      <div className="block-card-header">
        Block ID: <span className="mono-data">{displayId}</span>
      </div>
      <div className="block-card-body">
        <p><span class="block-card-label">Hash:</span> <code className="mono-data">{block.hash ?? 'N/A'}</code></p>
        <p><span class="block-card-label">Previous Hash:</span> <code className="mono-data">{block.previousBlockHash ?? 'N/A'}</code></p>
        <p><span class="block-card-label">Creator:</span> <code className="mono-data">{block.creator ?? 'N/A'}</code></p>
        <p><span class="block-card-label">Timestamp:</span> {formatTimestamp(block.timestamp)}</p>
      </div>
      <div className="block-card-footer">
        Transactions: {txnCount}
      </div>
    </div>
  );
};

export default BlockCard; 