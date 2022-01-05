# Description of Network

This document is divided into four parts. The first discusses the Saito mechanism for pruning old data at market prices. The second explains how blocks are produced. The third explains how the block reward is issued. The fourth explains how to ensure attackers always lose money attacking the network.

## 1. PRUNING THE BLOCKCHAIN

Saito divides the blockchain into "epochs" of N blocks. If the latest block is 500,000 and N is 100,000 blocks, the current epoch streches from block 400,001 onwards.

Once a block falls out of the current epoch, its unspent transaction outputs (UTXO) are considered invalid by consensus rules. Any UTXO from that block which contains enough tokens to pay a rebroadcasting fee must be re-included by the producer of the next block in that block for the block to be considered valid. The rebroadcasting fee is twice the average fee per byte paid by new transactions over a smoothing period.

Block producers rebroadcast UTXO slips by creating special "automatic transaction rebroadcasting" (ATR) transactions. These ATR transactions include the original transaction in an associated message field, but have a new UTXO. Each UTXO that meets rebroadcast criteria is rebroadcast in a separate ATR transaction. The rebroadcasting fee is deducted from each UTXO and added to the block reward. After two epochs block producers will no longer require access to historical block data, but are required to retain the 32-byte header hash to prove the connection with the genesis block.


## 2. PRODUCING BLOCKS

Saito adds cryptographic signatures transactions. When users send a transaction into the network they add a routing signature that specifies which node received it. The nodes in the network add similar transactions as they forward them. Each transaction contains an unforgeable record of the path it takes into the network. The same transaction sitting in two different mempools will consist of the same core-transaction but have a different set of routing signatures.

The blockchain sets a "difficulty" for block production which is derived from a consensus value (burnfee). This difficulty is met by producing a block that contains enough "routing work" in its included transactions. The amount of "work" embedded in any transaction is the value of its fee halved by each additional hop beyond the first that the transaction has taken into the network. Put simply, the value each transaction contributes to producing blocks drops as the routing-path grows.

Consensus rules specify that nodes cannot use "routing work" from transactions that do not include them on their routing path. There is no payment for producing a block: when a block is produced all of the fees in the block are immediately burned.

## 3. THE PAYMENT LOTTERY

Each block contains a proof-of-work challenge in the form of its block hash. When a block is produced miners on the network begin to hash to solve the block. Should a miner find a solution to this challenge, they broadcast it into the network as part of a normal Saito transaction. We call the solution the "golden ticket".

Block producers may include the golden ticket in their next block. If a single valid golden ticket is included in the very next block the network will split the block reward for the previous block between the miner that found the solution and a lucky routing node. The routing node is selected by hashing the nonce that selected the winning miner. That random number picks a winning transaction in the block, with the chance of selection proportional to the total fee paid. The tx-selection hash is then hashed again to generate a random number that picks a routing node from the routing paths in the transaction. The chance of any routing node being selected is proportional to its private amount of routing work (the value that transaction would have represented to it for paying off the burn fee, had that routing node produced a block) as a percent of the total aggregate routing work (the sum of all private amounts of routing work).\footnote[1]{If a transaction paying a 10 SAITO fee passes through two relay nodes before its inclusion in a block, the first relay node is deemed to have done 10 / 17.5 percent (57\%), the second node is deemed to have done 5 / 17.5 percent (29\%), and the block producer is deemed to have done 2.5 / 17.5 percent (14\%) of the routing work for that transaction. If a transaction is included without a routing path, the originator is assigned all of the work for that transaction.} 

The default "paysplit" of the network is 50-50. This means that if a block contains a golden ticket, 50 percent of the block reward is paid out to the miner and 50 percent is paid out to the random routing node. In the event that the block reward is seriously in excess of a smoothed average maintained over consensus (current target 1.25), the payment for both miner and router is reduced and the excess portion is burned for good. This reinforces the security provided by the staking tables against fee-flooding attacks and ensures that any attempt from attackers to game the lottery will result in a massive net loss of funds. Details on how the staking mechanism works are provided below.


Mining difficulty auto-adjusts until the network produces one golden ticket on average per block.


## 4. ADDING A DEADWEIGHT LOSS MECHANISM

Saito moves cost-of-attack above 100% of fee throughput by inclusion of a staking mechanism. This adds a staking table to the consensus state. Users can deposit UTXO into this table and earn a ROI from . This payment buffers against the ATR penalty assigned to rebroadcast transactions, and provides a way to keep store-of-value on the chain long-term. Staked UTXO are locked and unspendable until they are paid out, at which point they will automatically persist in the staking tables in a spendable (withdrawable) state. After several years the UTXO may be ejected and require manual re-staking.

The modification to the payment system happens as follows. Once a golden ticket is included in a block, if the previous block did not contain a golden ticket, the random variable used to select the winning routing node is hashed again to select a winning routing node in the previous block, and then hashed again to pick a winning entrant from the set of unpaid UTXO maintained in the table of stakers. This process is repeated until all unsolved preceding blocks have had their payments issued. An upper limit to backwards recusion may be applied for practical purposes, beyond which point any uncollected funds are simply burned..

When all stakers have been paid out, the staking table is recalculated as paid-out stakers are reinserted into the table for pending stakers. The amount paid to staking nodes is calculated as the average of the amount paid into the treasury by the staking reward during the *previous* genesis period, normalized to the percentage of the staking table represented by each UTXO. A longer smoothing period may be used if desired. And the same sort of growth limits may be applied that apply to mining. Limits may be put on the size of the staking pool to induce competition between stakers if desirable, although we prefer to keep the table completely open.

In order to make staking work with ATR, block producers who rebroadcast staked-UTXOs must indicate in their ATR transactions whether the outputs are in the current or pending pool. We recommend that a hash representation of the state of the staking table is included in every block in the form of a commitment, but this is not strictly necessary as it is theoretically possible to reconstruct the state of the staking pool within one genesis period at most.

A target difficulty is selected which represents the ideal number of staker-to-miner payouts. We are starting with 1 golden ticket every 2 blocks on average. At this rate, mining difficulty is adjusted upwards if two blocks containing golden tickets are found in a row and downwards if two blocks without golden tickets are found in a row.


### APPENDIX I: SAITO TERMINOLOGY

**Paysplit:** a variable between 0 and 1 that determines the percentage of the block reward that is allocated to mining nodes.

**Powspit:** a variable between 0 and 1 that determines the target percentage of blocks solved through golden tickets.

**Golden icket:** a transaction from a miner containing a valid solution to the computational lottery puzzle embodied in the previous block hash.

**Genesis Period:** the length of the epoch in number of blocks.


