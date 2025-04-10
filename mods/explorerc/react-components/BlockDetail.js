import React, { useEffect, useState } from 'react';
import BlockCard from './BlockCard'; // Reuse BlockCard for display

const BlockDetail = ({ hash, mod }) => {
  const [blockDataForCard, setBlockDataForCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlock = async () => {
      if (!hash || !mod) {
        setError('Missing hash or mod prop');
        setIsLoading(false);
        return;
      }
      console.log(`BlockDetail: Fetching block via UNIFIED /api/block/${hash}`);
      setIsLoading(true);
      setError(null);
      setBlockDataForCard(null);

      try {
        const response = await fetch(`/${mod.name}/api/block/${hash}`);
        if (!response.ok) {
            let errorText = `HTTP error! Status: ${response.status}`;
            try { 
                const errorData = await response.json();
                errorText = `${errorText} - ${errorData.message || 'Unknown server error'}`; 
            } catch (e) { 
                errorText = `${errorText} - ${await response.text() || 'Could not retrieve error details'}`;
            } 
            throw new Error(errorText);
        }
        const blockData = await response.json();
        
        console.log("BlockDetail: Received combined block data:", blockData);
        setBlockDataForCard(blockData);

      } catch (err) {
        console.error("Error fetching block detail:", err);
        setError(err.message || "Failed to load block details");
        setBlockDataForCard(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlock();
  }, [hash, mod]);

  // Handler for clicking a block hash (navigates to that block's detail view using hash routing)
  const handleBlockHashClick = (clickedHash) => {
    console.log(`BlockDetail: Navigating to block ${clickedHash} via hash`);
    // Update hash part of the URL
    window.location.hash = `/block/${clickedHash}`;
    // Optionally, force a reload if the router doesn't pick it up automatically
    // window.location.reload(); 
  };

  // Handler for clicking an address (navigates to wallet detail view using hash routing)
  const handleAddressClick = (clickedAddress) => {
    console.log(`BlockDetail: Navigating to wallet ${clickedAddress} via hash`);
    // Update hash part of the URL
    window.location.hash = `/address/${clickedAddress}`;
    // Optionally, force a reload
    // window.location.reload(); 
  };

  if (isLoading) {
    return <div className="block-detail-loading">Loading Block Details...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading block: {error}</div>;
  }

  if (!blockDataForCard) {
    return <div className="block-detail-empty">Block not found or data unavailable.</div>;
  }

  return (
    <div className="block-detail-container">
      {/* Pass the fetched block data directly AND the click handlers */}
      {blockDataForCard && (
         <BlockCard 
           block={blockDataForCard} 
           mod={mod} 
           onAddressClick={handleAddressClick} 
           onBlockHashClick={handleBlockHashClick} 
         />
      )}
    </div>
  );
};

export default BlockDetail; 