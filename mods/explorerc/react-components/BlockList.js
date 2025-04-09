import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import BlockCard from './BlockCard';

const BlockList = forwardRef(({ mod, latestBlockId, onAddressClick, onBlockHashClick }, ref) => {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [oldestFetchedId, setOldestFetchedId] = useState(null);
  const [highestFetchedId, setHighestFetchedId] = useState(null);
  const BLOCKS_PER_PAGE = 20; // Or get from config/props

  const observer = useRef();

  // Use useCallback to ensure the observer callback doesn't change unnecessarily
  const lastBlockElementRef = useCallback(node => {
    if (isLoading) return; // Don't trigger load if already loading
    if (observer.current) observer.current.disconnect(); // Disconnect previous observer

    observer.current = new IntersectionObserver(entries => {
      // When the observed element is intersecting (visible) and we have more blocks to load
      if (entries[0].isIntersecting && hasMore) {
        console.log('Intersection Observer triggered: Load More');
        loadMoreBlocks();
      }
    });

    // If the node exists, start observing it
    if (node) observer.current.observe(node);

  }, [isLoading, hasMore, loadMoreBlocks]); // Dependencies for the callback

  // Function to load blocks (modified to fetch initial set)
  const loadBlocks = useCallback(async (startId, prepend = false) => {
    if (isLoading) return; // Prevent concurrent fetches

    setIsLoading(true);
    setError(null);

    const count = BLOCKS_PER_PAGE;
    let newBlocks = [];

    try {
      let fetchEndId;
      if (prepend && highestFetchedId) {
        fetchEndId = highestFetchedId + BigInt(1);
        if (startId < fetchEndId) {
          console.log("BlockList: No new blocks to prepend.");
          setIsLoading(false);
          return;
        }
      } else {
        const endId = startId - BigInt(count - 1);
        fetchEndId = endId < BigInt(1) ? BigInt(1) : endId;
      }

      if (startId < fetchEndId) {
        console.log("BlockList: No more blocks to fetch in this range.");
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      console.log(`BlockList: Fetching blocks from ${startId} down to ${fetchEndId}... Prepend: ${prepend}`);
      newBlocks = await mod.fetchBlocksByIdRange(startId, fetchEndId);
      console.log('BlockList: Fetched blocks data:', newBlocks);

      if (newBlocks.length > 0) {
        const newestInBatch = newBlocks[0].id;
        const oldestInBatch = newBlocks[newBlocks.length - 1].id;

        setBlocks(prevBlocks => {
          const existingIds = new Set(prevBlocks.map(b => b.id.toString()));
          const uniqueNewBlocks = newBlocks.filter(b => !existingIds.has(b.id.toString()));
          const combined = prepend ? [...uniqueNewBlocks, ...prevBlocks] : [...prevBlocks, ...uniqueNewBlocks];
          combined.sort((a, b) => {
            const idA = typeof a.id === 'bigint' ? a.id : BigInt(a.id || 0);
            const idB = typeof b.id === 'bigint' ? b.id : BigInt(b.id || 0);
            return idB > idA ? 1 : (idB < idA ? -1 : 0);
          });
          return combined;
        });

        if (prepend) {
          if (highestFetchedId === null || newestInBatch > highestFetchedId) {
            setHighestFetchedId(newestInBatch);
          }
          if (oldestFetchedId === null) {
            setOldestFetchedId(oldestInBatch);
          }
        } else {
          setOldestFetchedId(oldestInBatch);
          if (highestFetchedId === null) {
            setHighestFetchedId(newestInBatch);
          }
          if (newBlocks.length < count || oldestInBatch <= BigInt(1)) {
            setHasMore(false);
            console.log("BlockList: Reached the end of available blocks.");
          }
        }
      } else {
        if (!prepend) {
          setHasMore(false);
          console.log("BlockList: No more older blocks found.");
        }
      }
    } catch (err) {
      console.error("BlockList: Error loading blocks:", err);
      setError(err.message || "Failed to load blocks");
    } finally {
      setIsLoading(false);
    }
  }, [mod, isLoading, hasMore, oldestFetchedId, highestFetchedId]); // Dependencies: mod, isLoading, hasMore, oldestFetchedId, highestFetchedId

  // Function to load more blocks
  const loadMoreBlocks = () => {
    if (!isLoading && hasMore && oldestFetchedId !== null && oldestFetchedId >= BigInt(0)) {
       // Fetch the next batch *below* the oldest currently fetched ID
       const nextStartId = oldestFetchedId - BigInt(1);
       if (nextStartId >= BigInt(0)) {
            console.log("BlockList: Loading more blocks starting from ID:", nextStartId);
            loadBlocks(nextStartId);
       } else {
           console.log("BlockList: Reached genesis or below, stopping load more.");
           setHasMore(false);
       }
    }
  };

  // Function to fetch newer blocks
  const refreshBlocks = useCallback(async () => {
    console.log("BlockList: Refresh requested.");
    if (isLoading || !highestFetchedId) return; // Don't refresh if loading or no baseline
    
    // Fetch the absolute latest ID first to know the upper bound
    let latestIdOnChain;
    try {
      latestIdOnChain = await mod.fetchLatestBlockId();
      if (latestIdOnChain > highestFetchedId) {
        console.log(`BlockList: New blocks detected (up to ${latestIdOnChain}). Fetching...`);
        // Call loadBlocks to prepend new blocks
        await loadBlocks(latestIdOnChain, true); 
      } else {
        console.log("BlockList: No new blocks detected on refresh.");
        // Optionally provide user feedback e.g., using siteMessage
      }
    } catch (err) {
      console.error("BlockList: Error fetching latest ID during refresh:", err);
      setError(err.message || "Failed to check for new blocks");
    }
  }, [mod, isLoading, highestFetchedId, loadBlocks]);

  // Expose the refresh function via ref
  useImperativeHandle(ref, () => ({
    refreshBlocks
  }));

  // Initial load effect
  useEffect(() => {
    if (latestBlockId !== null && blocks.length === 0 && highestFetchedId === null) {
      console.log("BlockList: Initial load triggered:", latestBlockId);
      setOldestFetchedId(latestBlockId); // Temporarily set oldest for first fetch
      setHighestFetchedId(latestBlockId); // Set highest for first fetch
      loadBlocks(latestBlockId, false); // Initial load is like appending to empty list
    }
  }, [latestBlockId, blocks.length, highestFetchedId, loadBlocks]);

  if (!blocks || blocks.length === 0) {
    if (isLoading) {
        return <div className="block-list-loading">Loading initial blocks...</div>;
    }
    return <div className="block-list-empty">No blocks found or still loading.</div>;
  }

  return (
    <div className="block-list">
      {blocks.map((block, index) => {
        // Attach the ref to the last element in the current list
        if (blocks.length === index + 1) {
          return (
            <div ref={lastBlockElementRef} key={block?.id?.toString() || block?.hash || index}>
              <BlockCard 
                block={block} 
                mod={mod} 
                onAddressClick={onAddressClick} 
                onBlockHashClick={onBlockHashClick}
              />
            </div>
          );
        } else {
          return <BlockCard key={block?.id?.toString() || block?.hash || index} block={block} mod={mod} onAddressClick={onAddressClick} onBlockHashClick={onBlockHashClick} />;
        }
      })}
      {isLoading && <div className="block-list-loading">Loading more blocks...</div>} 
      {!hasMore && blocks.length > 0 && <div className="block-list-end">End of blocks.</div>}
      {!isLoading && error && <div className="error-message">Error loading blocks: {error}</div>}
      {!isLoading && hasMore && blocks.length > 0 && (
        <button onClick={loadMoreBlocks} className="load-more-button">
          Load More Blocks
        </button>
      )}
    </div>
  );
});

export default BlockList; 