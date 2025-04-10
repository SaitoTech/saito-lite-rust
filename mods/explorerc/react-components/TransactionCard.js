import { JsonViewer } from '@textea/json-viewer';
import React, { useState } from 'react';

// Transaction Type mapping (based on provided snippet)
const txTypes = {
  0: { name: 'Normal' },
  1: { name: 'Fee Payment' },
  2: { name: 'Golden Ticket'},
  3: { name: 'ATR' },
  4: { name: 'VIP (deprecated)' },
  5: { name: 'SPV' },
  6: { name: 'Network Issuance' },
  7: { name: 'Block Stake' },
  8: { name: 'Bound' }
};

const TransactionCard = ({ tx, index, onAddressClick }) => {
  const [isJsonVisible, setIsJsonVisible] = useState(false);

  if (!tx) {
    return <div className="transaction-card transaction-card-empty">No transaction data.</div>;
  }

  // Determine transaction type using the mapping
  const getTransactionType = (transaction) => {
    const typeCode = transaction.type;
    if (txTypes[typeCode]) {
        return txTypes[typeCode].name;
    } 
    // Fallback if type code is unknown or type field doesn't exist
    if (transaction.msg) { 
        if (transaction.msg.module) return transaction.msg.module; 
        if (transaction.msg.request) return transaction.msg.request; 
    } 
    return 'Unknown'; 
  };

  // Get sender (first address in 'from' array, if exists)
  const sender = tx.from && tx.from.length > 0 ? tx.from[0].publicKey || tx.from[0].address : 'N/A';
  const type = getTransactionType(tx);
  const isSenderClickable = onAddressClick && sender && sender !== 'N/A';

  // Function to toggle JSON visibility
  const toggleJsonVisibility = () => {
    setIsJsonVisible(!isJsonVisible);
  };

  // Function to handle sender click
  const handleSenderClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); // Prevent triggering JSON toggle
    if (isSenderClickable) {
      onAddressClick(sender);
    }
  };

  return (
    <div className="transaction-card">
      {/* Header can stay as is or be removed if TX# is part of the row */}
      {/* <div className="tx-card-header">TX#: {index + 1}</div> */}
      <div className="tx-card-body tx-body-row" onClick={toggleJsonVisibility} style={{ cursor: 'pointer' }}>
        {/* Row container for TX#, Type, Sender */}
        <div className="tx-detail-item tx-detail-index">
            <span className="tx-card-label">TX#:</span>
            <span className="tx-data">{index + 1}</span>
        </div>
        <div className="tx-detail-item tx-detail-type">
            <span className="tx-card-label">Type:</span> 
            <span className="tx-data">{type}</span>
        </div>
        <div className="tx-detail-item tx-detail-sender">
            <span className="tx-card-label">Sender:</span> 
            <code 
              className={`mono-data tx-data truncate ${isSenderClickable ? 'clickable-address' : ''}`}
              onClick={isSenderClickable ? handleSenderClick : undefined}
              title={isSenderClickable ? `View details for ${sender}` : sender}
            >
              {sender}
            </code>
        </div>
        {/* Add Chevron at the end of the row */}
        <div className={`tx-detail-item tx-detail-chevron ${isJsonVisible ? 'expanded' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
      {/* Conditionally rendered JSON Tree */}
      {isJsonVisible && (
        <div className="tx-json-viewer">
          <JsonViewer 
            value={tx} 
            theme="light" // Or use a dark theme if preferred
            displayDataTypes={false}
            displayObjectSize={false}
            indentWidth={2}
            collapseStringsAfterLength={50}
            // Add other props as needed from @textea/json-viewer docs
          />
        </div>
      )}
    </div>
  );
};

export default TransactionCard; 