import React, { useEffect, useState } from 'react';
import BlockCard from './BlockCard'; // Reuse BlockCard for display

const BlockDetail = ({ hash, mod }) => {
  const [blockDataForCard, setBlockDataForCard] = useState(null); // Renamed state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlock = async () => {
      if (!hash || !mod) {
        setError('Missing hash or mod prop');
        setIsLoading(false);
        return;
      }
      console.log(`BlockDetail: Fetching block via /api/block?hash=${hash}`);
      setIsLoading(true);
      setError(null);
      setBlockDataForCard(null); // Clear previous data

      try {
        const response = await fetch(`/${mod.name}/api/block?hash=${hash}`);
        if (!response.ok) {
            let errorText = `HTTP error! Status: ${response.status}`;
            try { errorText = await response.text() || errorText; } catch (e) {} 
            throw new Error(errorText);
        }
        const data = await response.json();
        
        if (data.status === 'success' && data.blockData) {
             // Construct the object BlockCard expects
             const reconstructedBlock = {
                ...data.blockData, // Spread the main JSON data (id, creator, timestamp, etc.)
                hash: hash, // Ensure hash is top-level
                previousBlockHash: data.blockData.previous_block_hash || data.blockData.previousBlockHash || 'N/A', // Handle potential naming variations
                transactions: data.blockData.transactions || [], // Ensure transactions array exists
                transactionCount: (data.blockData.transactions || []).length, // Calculate count
                // Properties typically NOT in toJson() - BlockCard needs defaults or API enhancement
                longestChain: null, 
                goldenTicket: null, 
                difficulty: null, 
                burnFee: null, 
             };
            console.log("BlockDetail: Reconstructed block for BlockCard:", reconstructedBlock);
            setBlockDataForCard(reconstructedBlock);
        } else {
            throw new Error(data.message || 'Failed to fetch block data for display');
        }

      } catch (err) {
        console.error("Error fetching block detail:", err);
        setError(err.message || "Failed to load block details");
        setBlockDataForCard(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlock();
  }, [hash, mod]); // Re-fetch if hash or mod changes

  if (isLoading) {
    return <div className="block-detail-loading">Loading Block Details...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading block: {error}</div>;
  }

  if (!blockDataForCard) { // Check renamed state
    return <div className="block-detail-empty">Block not found or data unavailable.</div>;
  }

  return (
    <div className="block-detail-container">
      {/* Pass the correctly structured data and null handlers */}
      <BlockCard block={blockDataForCard} mod={mod} onAddressClick={null} onBlockHashClick={null} />
    </div>
  );
};

export default BlockDetail; 