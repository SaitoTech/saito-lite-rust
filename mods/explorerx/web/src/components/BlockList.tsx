import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimestamp } from '../utils/format';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

interface Block {
  id: string;
  hash: string;
  creator: string;
  timestamp: string;
  transactions: any[];
}

const BlockList: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [page, setPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, [page]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/explorerx/api/blocks/${page}`);
      const data = await response.json();
      setBlocks(data.blocks);
      setTotalBlocks(data.totalBlocks);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="block-list">
      <SearchBar />
      <h2>Recent Blocks</h2>
      <div className="block-grid">
        <div className="block-header">
          <div>Height</div>
          <div>Hash</div>
          <div>Creator</div>
          <div>Time</div>
          <div>Txs</div>
        </div>
        {blocks.map(block => (
          <div key={block.hash} className="block-row">
            <div>{block.id}</div>
            <div>
              <Link to={`/block/${block.hash}`}>{block.hash}</Link>
            </div>
            <div className="ellipsis">{block.creator}</div>
            <div>{formatTimestamp(block.timestamp)}</div>
            <div>{block.transactions.length}</div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalItems={BigInt(totalBlocks)}
        itemsPerPage={200}
        onPageChange={setPage}
      />
    </div>
  );
};

export default BlockList; 