import React, { useCallback, useEffect, useRef, useState } from 'react';
import BalanceList from './BalanceList'; // Import the new component
import BlockDetail from './BlockDetail'; // Import BlockDetail
import BlockList from './BlockList'; // Import the BlockList component
import Header from './Header'; // Import the Header component
import NodeInfo from './NodeInfo'; // Import the NodeInfo component
import WalletCard from './WalletCard'; // Import WalletCard
// Remove the require for the separate API module
// const { fetchBlocksByIdRange, fetchLatestBlockId } = require('../web/js/api');

const BLOCKS_PER_FETCH = 10; // How many blocks to fetch initially and on load more

const App = ({ app, mod }) => { // Receive app and mod as props if needed
  // Remove block-specific state from App
  // const [blocks, setBlocks] = useState([]); 
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);
  // const [latestFetchedId, setLatestFetchedId] = useState(null);
  // const [oldestFetchedId, setOldestFetchedId] = useState(null);
  // const [hasMore, setHasMore] = useState(true);
  
  // Keep NodeInfo state
  const [nodeInfo, setNodeInfo] = useState(null);
  const [latestBlockId, setLatestBlockId] = useState(null); // Keep this for BlockList initial load
  const [nodeInfoError, setNodeInfoError] = useState(null);
  
  // Keep View Management State
  const [currentView, setCurrentView] = useState('blockList'); // 'blockList', 'walletDetail', 'blockDetail', 'balanceList'
  const [walletAddress, setWalletAddress] = useState(null); 
  const [blockHash, setBlockHash] = useState(null); // State for BlockDetail view
  
  // Ref for BlockList
  const blockListRef = useRef();
  
  // --- Routing Logic --- 

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash;
    console.log("Hash changed:", hash);
    if (hash.startsWith('#/address/')) {
      const address = hash.substring('#/address/'.length);
      if (address) {
          setWalletAddress(address);
          setBlockHash(null); // Clear other view states
          setCurrentView('walletDetail');
          console.log(`Routing to Wallet View for: ${address}`);
      } else {
          setCurrentView('blockList');
          setWalletAddress(null);
          setBlockHash(null);
          window.location.hash = '#/'; 
      }
    } else if (hash.startsWith('#/block/')) { // Handle block hash
      const bHash = hash.substring('#/block/'.length);
      if (bHash && /^[a-f0-9]{64}$/i.test(bHash)) { // Basic hash validation
          setBlockHash(bHash);
          setWalletAddress(null); // Clear other view states
          setCurrentView('blockDetail');
          console.log(`Routing to Block View for: ${bHash}`);
      } else {
          // Invalid block hash, go to default
          setCurrentView('blockList');
          setWalletAddress(null);
          setBlockHash(null);
          window.location.hash = '#/';
      }
    } else if (hash === '#/balances') { // Add route for balances
        setCurrentView('balanceList');
        setWalletAddress(null);
        setBlockHash(null);
        console.log("Routing to Balance List View");
    } else {
      // Default to block list view 
      // Ensure we only switch IF NOT already on blockList to avoid loops
      if (!['blockList'].includes(currentView) || hash !== '#/') {
          setCurrentView('blockList');
          setWalletAddress(null);
          setBlockHash(null);
          console.log("Routing to Block List View (Default)");
          // Only reset hash if it wasn't explicitly cleared or set elsewhere
          if (window.location.hash !== '#/' && !hash.startsWith('#/address/') && !hash.startsWith('#/block/') && hash !== '#/balances') {
             window.location.hash = '#/';
          }
      } 
    }
  }, [currentView]);

  // Effect for Initial Load Routing & Hash Change Listener
  useEffect(() => {
    // Initial check
    handleHashChange(); 

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]); // Run when handleHashChange updates (which now happens when currentView changes)

  // Function to fetch blocks using mod methods
  // const loadBlocks = useCallback(async (startId, count) => {
  //   if (isLoading || !hasMore) return;

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // Calculate the end ID (inclusive)
  //     const endId = startId - BigInt(count - 1);
  //     const fetchEndId = endId < BigInt(1) ? BigInt(1) : endId; // Don't go below block 1

  //     if (startId < fetchEndId) {
  //       console.log("No more blocks to fetch in this range.");
  //       setHasMore(false);
  //       setIsLoading(false);
  //       return;
  //     }

  //     console.log(`Fetching blocks from ${startId} down to ${fetchEndId} using mod method...`);
  //     const newBlocks = await mod.fetchBlocksByIdRange(startId, fetchEndId);

  //     // *** Add logging here ***
  //     console.log('Fetched blocks data via mod:', newBlocks);

  //     // Filter out duplicates just in case API overlaps or retries happen
  //     setBlocks(prevBlocks => {
  //       const existingIds = new Set(prevBlocks.map(b => b.id.toString()));
  //       const uniqueNewBlocks = newBlocks.filter(b => !existingIds.has(b.id.toString()));
  //       return [...prevBlocks, ...uniqueNewBlocks].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // Ensure sort order
  //     });

  //     // Update fetched ID boundaries
  //     if (newBlocks.length > 0) {
  //       const newestInBatch = newBlocks[0].id; // API returns descending order
  //       const oldestInBatch = newBlocks[newBlocks.length - 1].id;

  //       if (latestFetchedId === null || newestInBatch > latestFetchedId) {
  //         setLatestFetchedId(newestInBatch);
  //       }
  //       if (oldestFetchedId === null || oldestInBatch < oldestFetchedId) {
  //         setOldestFetchedId(oldestInBatch);
  //       }
  //          // If we fetched fewer blocks than requested OR reached block 1, assume no more
  //       if (newBlocks.length < count || oldestInBatch <= BigInt(1)) {
  //         setHasMore(false);
  //         console.log("Reached the end of available blocks.");
  //       }
  //     } else {
  //       // If API returns empty array, assume no more blocks in this range
  //       setHasMore(false);
  //       console.log("No blocks found in the requested range.");
  //     }

  //   } catch (err) {
  //     console.error("Error loading blocks:", err);
  //     setError(err.message || "Failed to load blocks");
  //     // Potentially stop trying if there's an error, or implement retry logic
  //     // setHasMore(false); 
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [isLoading, hasMore, latestFetchedId, oldestFetchedId, mod]); // *** Add mod to dependency array ***

  // Initial Load: Use mod methods
  // const initialLoad = async () => {
  //   console.log("App.js: Starting initialLoad...");
  //   setIsLoading(true);
  //   try {
  //     console.log("App.js: Calling mod.fetchLatestBlockId...");
  //     const latestId = await mod.fetchLatestBlockId();
  //     console.log("App.js: Fetched latest Block ID via mod:", latestId?.toString());

  //     if (latestId > BigInt(0)) {
  //       setLatestFetchedId(latestId);
  //       console.log("App.js: Calling loadBlocks for initial batch...");
  //       await loadBlocks(latestId, BLOCKS_PER_FETCH);
  //       console.log("App.js: Initial loadBlocks call completed.");
  //     } else {
  //       console.log("App.js: latestId is not greater than 0, skipping initial block load.");
  //       setHasMore(false); // No blocks if latest ID is 0 or less
  //     }
  //   } catch (err) {
  //     console.error("App.js: Error during initial load:", err);
  //     setError(err.message || "Failed to fetch initial block data");
  //   } finally {
  //     console.log("App.js: initialLoad finally block.");
  //     // Loading state is handled within loadBlocks, but set to false if skipped or error before loadBlocks
  //     if (!latestFetchedId) { 
  //          setIsLoading(false);
  //     }
  //   }
  // };

  // // Effect for Initial Load
  // useEffect(() => {
  //   initialLoad();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mod]); // *** Change dependency array to mod ***

  // Function to load more blocks (triggered by BlockList)
  // const loadMoreBlocks = useCallback(() => {
  //   if (oldestFetchedId && oldestFetchedId > BigInt(1)) {
  //     const nextStartId = oldestFetchedId - BigInt(1);
  //     loadBlocks(nextStartId, BLOCKS_PER_FETCH);
  //   }
  //    else {
  //     console.log("Load more called, but no more blocks expected.");
  //      setHasMore(false); // Explicitly set hasMore to false if we are at the end
  //   }
  // }, [oldestFetchedId, loadBlocks]);

  // Fetch Node Info and Latest Block ID
  const fetchInitialData = useCallback(async () => {
    console.log(`${mod.returnName()}: App component fetching initial data...`);
    setNodeInfoError(null);
    try {
      // Fetch node info using the module's method
      const info = await mod.fetchNodeInfo();
      console.log(`${mod.returnName()}: Fetched Node Info:`, info);
      setNodeInfo(info);
      // Fetch latest block ID directly or use from node info if available
      if (info && info.latestBlockId && info.latestBlockId !== 'N/A') {
         setLatestBlockId(BigInt(info.latestBlockId));
      } else {
          const id = await mod.fetchLatestBlockId();
          console.log(`${mod.returnName()}: Fetched Latest Block ID:`, id);
          setLatestBlockId(id);
      }
    } catch (error) {
      console.error(`${mod.returnName()}: Error fetching initial data:`, error);
      setNodeInfoError('Failed to load node information. Please try refreshing.');
      // Set defaults or leave as null
      setNodeInfo(null);
      setLatestBlockId(null);
    }
  }, [mod]); // Depend on mod object

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- View Switching Logic --- 

  // Function called by Header search or address click to show WalletCard
  const showWalletView = (address) => {
    console.log(`Switching to Wallet View for address: ${address}`);
    window.location.hash = `#/address/${address}`;
  };
  
  // Function called by Header search or block hash click
  const showBlockView = (hash) => {
      console.log(`Switching to Block View for hash: ${hash}`);
      window.location.hash = `#/block/${hash}`; // Update hash to trigger view change
  };

  // Function to return to the default Block List view
  const showBlockListView = () => {
    console.log("Switching back to Block List View");
    window.location.hash = '#/';
  };

  // Placeholder function to handle showing the Balances view
  const showBalancesView = () => {
    console.log("Switching to Balances View");
    window.location.hash = '#/balances'; 
  };

  // Handler for NodeInfo refresh request
  const handleRefreshBlocksRequest = () => {
    console.log("App: Refresh blocks request received");
    if (blockListRef.current) {
      blockListRef.current.refreshBlocks();
    }
  };

  return (
    <div className="saito-container">
      <Header 
        onAddressSearch={showWalletView} 
        onBlockHashSearch={showBlockView} // Pass the updated handler
        onShowBalances={showBalancesView} // Pass the new handler
      />
      <main className="saito-main">
        {/* Conditionally render different views */} 
        {currentView === 'blockList' && (
          <>
            {nodeInfoError ? (
              <div className="error-message">{nodeInfoError}</div>
            ) : (
              <NodeInfo 
                 info={nodeInfo} 
                 mod={mod} 
                 app={app} // Pass app for event listener
                 onRefreshBlocksRequest={handleRefreshBlocksRequest} // Pass handler
              /> 
            )}
            
            {latestBlockId !== null ? (
              <BlockList
                ref={blockListRef} // Assign ref
                mod={mod}
                latestBlockId={latestBlockId} 
                onAddressClick={showWalletView}
                onBlockHashClick={showBlockView}
              />
            ) : (
              !nodeInfoError && <div>Loading blocks...</div> // Show loading only if no error
            )}
          </>
        )}
        
        {currentView === 'walletDetail' && walletAddress && (
          <>
            <button onClick={showBlockListView} className="saito-button-secondary back-button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Back to Blocks
            </button>
            <WalletCard address={walletAddress} mod={mod} />
          </>
        )}
        
        {/* Render Block Detail View */}
        {currentView === 'blockDetail' && blockHash && (
          <>
             <button onClick={showBlockListView} className="saito-button-secondary back-button">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
               </svg>
               Back to Blocks
             </button>
             <BlockDetail hash={blockHash} mod={mod} /> 
          </>
        )}

        {/* Add rendering for the new balance list view */} 
        {currentView === 'balanceList' && (
           <>
             <button onClick={showBlockListView} className="saito-button-secondary back-button">
               {/* SVG Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heroicon">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
               </svg>
               Back to Blocks
             </button>
            <BalanceList mod={mod} />
          </>
        )}

      </main>
      {/* Placeholder for a Footer component */}
    </div>
  );
};

export default App; 