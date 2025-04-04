import React, { useCallback, useRef } from 'react';
import BlockCard from './BlockCard';

const BlockList = ({ blocks, isLoading, hasMore, onLoadMore }) => {
  const observer = useRef();

  // Use useCallback to ensure the observer callback doesn't change unnecessarily
  const lastBlockElementRef = useCallback(node => {
    if (isLoading) return; // Don't trigger load if already loading
    if (observer.current) observer.current.disconnect(); // Disconnect previous observer

    observer.current = new IntersectionObserver(entries => {
      // When the observed element is intersecting (visible) and we have more blocks to load
      if (entries[0].isIntersecting && hasMore) {
        console.log('Intersection Observer triggered: Load More');
        onLoadMore();
      }
    });

    // If the node exists, start observing it
    if (node) observer.current.observe(node);

  }, [isLoading, hasMore, onLoadMore]); // Dependencies for the callback

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
              <BlockCard block={block} />
            </div>
          );
        } else {
          return <BlockCard key={block?.id?.toString() || block?.hash || index} block={block} />;
        }
      })}
      {isLoading && <div className="block-list-loading">Loading more blocks...</div>} 
      {!hasMore && blocks.length > 0 && <div className="block-list-end">End of blocks.</div>}
    </div>
  );
};

export default BlockList; 