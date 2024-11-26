const fs = require('fs');

function deserializeBlock(buffer) {
  let offset = 0;

  const readUint32 = () => {
    const value = buffer.readUInt32BE(offset);
    offset += 4;
    return value;
  };

  const readBytes = (length) => {
    const value = buffer.slice(offset, offset + length);
    offset += length;
    return value;
  };

  const block = {};

  // Transaction length
  block.txCount = readUint32();

  // Block ID
  block.id = readUint32();

  // Timestamp
  block.timestamp = readUint32();

  // Previous Block Hash
  block.previousBlockHash = readBytes(32).toString('hex');

  // Creator
  block.creator = readBytes(32).toString('hex');

  // Merkle Root
  block.merkleRoot = readBytes(32).toString('hex');

  // Signature
  block.signature = readBytes(64).toString('hex');

  // Remaining fields (graveyard, treasury, etc.)
  const fields = [
    'graveyard',
    'treasury',
    'burnfee',
    'difficulty',
    'avgTotalFees',
    'avgFeePerByte',
    'avgNolanRebroadcastPerBlock',
    'previousBlockUnpaid',
    'avgTotalFeesNew',
    'avgTotalFeesATR',
    'avgPayoutRouting',
    'avgPayoutMining',
    'avgPayoutTreasury',
    'avgPayoutGraveyard',
    'avgPayoutATR',
    'totalPayoutRouting',
    'totalPayoutMining',
    'totalPayoutTreasury',
    'totalPayoutGraveyard',
    'totalPayoutATR',
    'totalFees',
    'totalFeesNew',
    'totalFeesATR',
    'feePerByte'
  ];
  fields.forEach((field) => {
    block[field] = readUint32();
  });

  // Transactions
  block.transactions = [];
  for (let i = 0; i < block.txCount; i++) {
    const txLength = readUint32();
    block.transactions.push(readBytes(txLength).toString('hex'));
  }

  return block;
}

// Usage
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node deserialize.js <path_to_file>');
  process.exit(1);
}

const fileBuffer = fs.readFileSync(filePath);
const deserializedBlock = deserializeBlock(fileBuffer);
console.log(JSON.stringify(deserializedBlock, null, 2));
