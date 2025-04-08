import React, { useCallback, useEffect, useRef, useState } from 'react';
import BlockCard from './BlockCard';

const BlockList = ({ mod, latestBlockId, onAddressClick, onBlockHashClick }) => {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [oldestFetchedId, setOldestFetchedId] = useState(null);
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
  const loadBlocks = useCallback(async (startId) => {
    if (isLoading) return; // Prevent concurrent fetches

    setIsLoading(true);
    setError(null);

    const count = BLOCKS_PER_PAGE;
    let newBlocks = [];

    try {
      const endId = startId - BigInt(count - 1);
      const fetchEndId = endId < BigInt(1) ? BigInt(1) : endId;

      if (startId < fetchEndId) {
        console.log("BlockList: No more blocks to fetch in this range.");
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      console.log(`BlockList: Fetching blocks from ${startId} down to ${fetchEndId}...`);
      newBlocks = await mod.fetchBlocksByIdRange(startId, fetchEndId);
      console.log('BlockList: Fetched blocks data via mod:', newBlocks);

      if (newBlocks.length > 0) {
        setBlocks(prevBlocks => {
          const existingIds = new Set(prevBlocks.map(b => b.id.toString()));
          const uniqueNewBlocks = newBlocks.filter(b => !existingIds.has(b.id.toString()));
          // Keep sorted by timestamp descending (newest first)
          const combined = [...prevBlocks, ...uniqueNewBlocks];
          combined.sort((a, b) => {
             // Handle potential BigInts for IDs
            const idA = typeof a.id === 'bigint' ? a.id : BigInt(a.id || 0);
            const idB = typeof b.id === 'bigint' ? b.id : BigInt(b.id || 0);
            if (idB > idA) return 1;
            if (idB < idA) return -1;
            return 0;
          });
          return combined;
        });

        const oldestInBatch = newBlocks[newBlocks.length - 1].id;
        setOldestFetchedId(oldestInBatch);

        if (newBlocks.length < count || oldestInBatch <= BigInt(1)) {
          setHasMore(false);
          console.log("BlockList: Reached the end of available blocks.");
        }
      } else {
        setHasMore(false);
        console.log("BlockList: No blocks found in the requested range.");
      }
    } catch (err) {
      console.error("BlockList: Error loading blocks:", err);
      setError(err.message || "Failed to load blocks");
    } finally {
      setIsLoading(false);
    }
  }, [mod, isLoading, hasMore]); // Dependencies: mod, isLoading, hasMore

  // Initial load effect
  useEffect(() => {
    if (latestBlockId !== null && blocks.length === 0) {
      console.log("BlockList: Initial load triggered with latestBlockId:", latestBlockId);
      setOldestFetchedId(latestBlockId); // Start fetching from the latest
      loadBlocks(latestBlockId); 
    }
  }, [latestBlockId, blocks.length, loadBlocks]);

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
};

export default BlockList; 