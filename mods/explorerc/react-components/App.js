import React, { useCallback, useEffect, useState } from 'react';
import BlockList from './BlockList'; // Import the BlockList component
import Header from './Header'; // Import the Header component
import NodeInfo from './NodeInfo'; // Import the NodeInfo component
// Remove the require for the separate API module
// const { fetchBlocksByIdRange, fetchLatestBlockId } = require('../web/js/api');

const BLOCKS_PER_FETCH = 10; // How many blocks to fetch initially and on load more

const App = ({ app, mod }) => { // Receive app and mod as props if needed
  const [blocks, setBlocks] = useState([]); // State to hold block data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestFetchedId, setLatestFetchedId] = useState(null); // Track the highest ID fetched
  const [oldestFetchedId, setOldestFetchedId] = useState(null); // Track the lowest ID fetched
  const [hasMore, setHasMore] = useState(true); // Assume there are more blocks initially

  // Function to fetch blocks using mod methods
  const loadBlocks = useCallback(async (startId, count) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      // Calculate the end ID (inclusive)
      const endId = startId - BigInt(count - 1);
      const fetchEndId = endId < BigInt(1) ? BigInt(1) : endId; // Don't go below block 1

      if (startId < fetchEndId) {
        console.log("No more blocks to fetch in this range.");
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      console.log(`Fetching blocks from ${startId} down to ${fetchEndId} using mod method...`);
      const newBlocks = await mod.fetchBlocksByIdRange(startId, fetchEndId);

      // *** Add logging here ***
      console.log('Fetched blocks data via mod:', newBlocks);

      // Filter out duplicates just in case API overlaps or retries happen
      setBlocks(prevBlocks => {
        const existingIds = new Set(prevBlocks.map(b => b.id.toString()));
        const uniqueNewBlocks = newBlocks.filter(b => !existingIds.has(b.id.toString()));
        return [...prevBlocks, ...uniqueNewBlocks].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // Ensure sort order
      });

      // Update fetched ID boundaries
      if (newBlocks.length > 0) {
        const newestInBatch = newBlocks[0].id; // API returns descending order
        const oldestInBatch = newBlocks[newBlocks.length - 1].id;

        if (latestFetchedId === null || newestInBatch > latestFetchedId) {
          setLatestFetchedId(newestInBatch);
        }
        if (oldestFetchedId === null || oldestInBatch < oldestFetchedId) {
          setOldestFetchedId(oldestInBatch);
        }
         // If we fetched fewer blocks than requested OR reached block 1, assume no more
        if (newBlocks.length < count || oldestInBatch <= BigInt(1)) {
          setHasMore(false);
          console.log("Reached the end of available blocks.");
        }
      } else {
        // If API returns empty array, assume no more blocks in this range
        setHasMore(false);
        console.log("No blocks found in the requested range.");
      }

    } catch (err) {
      console.error("Error loading blocks:", err);
      setError(err.message || "Failed to load blocks");
      // Potentially stop trying if there's an error, or implement retry logic
      // setHasMore(false); 
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, latestFetchedId, oldestFetchedId, mod]); // *** Add mod to dependency array ***

  // Initial Load: Use mod methods
  useEffect(() => {
    const initialLoad = async () => {
      console.log("App.js: Starting initialLoad...");
      setIsLoading(true);
      try {
        console.log("App.js: Calling mod.fetchLatestBlockId...");
        const latestId = await mod.fetchLatestBlockId();
        console.log("App.js: Fetched latest Block ID via mod:", latestId?.toString());

        if (latestId > BigInt(0)) {
          setLatestFetchedId(latestId);
          console.log("App.js: Calling loadBlocks for initial batch...");
          await loadBlocks(latestId, BLOCKS_PER_FETCH);
          console.log("App.js: Initial loadBlocks call completed.");
        } else {
          console.log("App.js: latestId is not greater than 0, skipping initial block load.");
          setHasMore(false); // No blocks if latest ID is 0 or less
        }
      } catch (err) {
        console.error("App.js: Error during initial load:", err);
        setError(err.message || "Failed to fetch initial block data");
      } finally {
        console.log("App.js: initialLoad finally block.");
        // Loading state is handled within loadBlocks, but set to false if skipped or error before loadBlocks
        if (!latestFetchedId) { 
             setIsLoading(false);
        }
      }
    };
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod]); // *** Change dependency array to mod ***

  // Function to load more blocks (triggered by BlockList)
  const loadMoreBlocks = useCallback(() => {
    if (oldestFetchedId && oldestFetchedId > BigInt(1)) {
      const nextStartId = oldestFetchedId - BigInt(1);
      loadBlocks(nextStartId, BLOCKS_PER_FETCH);
    }
     else {
      console.log("Load more called, but no more blocks expected.");
       setHasMore(false); // Explicitly set hasMore to false if we are at the end
    }
  }, [oldestFetchedId, loadBlocks]);

  return (
    <div className="saito-container">
      <Header />
      <main className="saito-main">
        <NodeInfo app={app} mod={mod} /> {/* Render NodeInfo here */}
        {error && <div className="error-message">Error: {error}</div>}
        <BlockList
          blocks={blocks}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMoreBlocks}
        /> {/* Render BlockList below NodeInfo */}
      </main>
      {/* Placeholder for a Footer component */}
    </div>
  );
};

export default App; 