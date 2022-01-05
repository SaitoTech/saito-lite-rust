# Optimal Attack Reward under Saito Networks

## Abstract

## Assumptions

## Methods

### Terms
>x = expected return of the attack \
>f = all transactions fees in the block \
>p = proportion of attacker fees in blocks \
>d = depth in number of blocks attacker waits to mine \
>c = cost of mining a golden ticket \
>Ps = paysplit (division of block reward between router and miner) \
>Pw = powsplit (division of pay between minter and stakers)

### Calculating Attack Reward

#### Saito Basics


In Saito the Block Reward is the made up of transaction fees.

In Saito the block reward does not go to the block creator. Rather, the reward is split between the routing network and a miner. The miner creates the randomness to select the node from the routing network that wins the routing reward. 

The proportion of the block reward awarded to the routing network and miner is known as the 'paysplit'. Here we will concentrate on Saito's standard implimentation of a paysplit of 0.5. 

The randomness is created by the miner solving a cryptographic puzzle on the hash of the proceeding block. The solution to the puzzle is called a 'golden ticket'. If no golden ticket is found, no block reward is paid to the network and no prize if paid to the miner.

In early versions of Saito unallocated block rewards that resulted from blocks going unsolved were burned or moved into the network treasury. In the production version token holders can stake their tokens. When a golden ticket is found and the previous block is paid, the same solution is hashed and recursively applied to any preceding blocks that have not be paid out. The unpaid routing and mining rewards are then paid to routers and stakers.

This represents an improvement to the Saito protocal. It provides an elegant way to accomodating variance in the mining of golden tickets, and it increases security above 100 percent of fee throughput in most cases.

The portion of reventue that goes to stakers can be determined using mining difficulty. Specifically mining difficulty can adjust to ensure an average of one golden ticket per _n_ blocks.

#### Description of the attack and parameters
We are assuming that an attacker is in possession of enough hashpower to control difficulty and be able to mine at approaching 100% of total hash on the network. For example a small new Saito class network with few nodes CPU mining in Javascript, and an attacker with a spare Bitcoin mining farm.

It is also assumed that the attacker has sufficient tokens and network connectivity to fill blocks with attack transactions routed only to themselves.

Given the attacker's ability to control difficulty we are assuming they will be completely successful in mining golden ticket solutions when they choose, though exponential increases in mining difficulty will ensure a set ratio of golden tickets per block.

Given these conditions the expected reward for an attack over time on the network will be:

> mining reward + routing reward - mining costs


#### Mining Reward
We are presuming the miner uses one of the golden ticket solutions found so their expected reward includes the miner reward or golden ticket prize.

$$ f \cdot Ps \cdot n $$

A miner cannot get paid for multiple golden ticket solutions, so for $n >1$ the expected reward is simply:

$$ f \cdot Ps$$

<img src="https://render.githubusercontent.com/render/math?invert_in_darkmode&math=f \cdot Ps">

#### Routing Payment

If the attacker finds a golden ticket that pays one their own node they are paid the entire block reward. The expected reward for a block into which the attacker has stuffed _p_ of their own fees is:

$$ f \cdot Ps \cdot p $$ 

But, the attacker is only getting the honest fees back, so for a single golden ticket solution the payout is the portion of fees that go to the routing reward $f\cdotPs& minus the fees the attacker put into the block $f\cdot p$:

$$ f \cdot Ps \cdot p - f \cdot p $$ 

Hasing to find n solutions yields an expected outcome of:

$$ f \cdot Ps \cdot (1-(1-p)^n) - f \cdot p$$

Given also that the attacker is waiting d blocks to hash, to optimise the number of blocks paying out in their favor, expected routing reward becomes:

$$ d \cdot (f \cdot Ps \cdot (1-(1-p)^n) - f \cdot p) $$


#### Mining Cost

Given the attacker's access to hashpower calculating mining cost is a simple function. The expected cost of mining _n_ golden tickets is: $c \cdot n$. But the attacker will stop mining if they have found a solution that has solved all outstanding blocks.

Of course, the miner will stop mining once they have found a golden ticket solution that pays them the full routing reward for all outstanding blocks.

The chance that a solution solves all blocks in the attacker's favour is $p^d$. So the expected savings per golden ticket, after the first is $(n-1) \cdot p^d$. The cost of mining when $n > 1$ is then:

$$ c \cdot n - ((n-1) \cdot p^d) $$

#### Total expected attack reward

Combining the above we have: 

For $n <1$:

$$ f \cdot Ps \cdot n + d \cdot (f \cdot Ps \cdot (1-(1-p)^n) - f \cdot p)- c \cdot n $$

For $n >= 1$:

$$ f \cdot Ps \cdot n + d \cdot (f \cdot Ps \cdot (1-(1-p)^n) - f \cdot p)- (c \cdot n - ((n-1) \cdot p^d)) $$

## Results

| No GTs | GT Payout | Routing Reward | Mining Cost | Result |
|:------:|-----------|----------------|-------------|--------|
| 1.00   | 100.00    | -100.00        | -50.00      | -50.00 |
| 1.07   | 100.00    | -95.53         | -52.48      | -48.00 |
| 1.13   | 100.00    | -91.26         | -54.95      | -46.21 |
| 1.20   | 100.00    | -87.18         | -57.43      | -44.60 |
| 1.26   | 100.00    | -83.28         | -59.90      | -43.18 |
| 1.33   | 100.00    | -79.55         | -62.38      | -41.93 |
| 1.40   | 100.00    | -76.00         | -64.85      | -40.85 |
| 1.46   | 100.00    | -72.60         | -67.33      | -39.92 |
| 1.53   | 100.00    | -69.35         | -69.80      | -39.15 |
| 1.59   | 100.00    | -66.25         | -72.28      | -38.53 |
| 1.66   | 100.00    | -63.29         | -74.75      | -38.04 |
| 1.73   | 100.00    | -60.46         | -77.23      | -37.68 |
| 1.79   | 100.00    | -57.75         | -79.70      | -37.45 |
| 1.86   | 100.00    | -55.17         | -82.18      | -37.35 |
| 1.92   | 100.00    | -52.70         | -84.65      | -37.35 |
| 1.99   | 100.00    | -50.35         | -87.13      | -37.47 |
| 2.06   | 100.00    | -48.10         | -89.60      | -37.70 |
| 2.12   | 100.00    | -45.95         | -92.08      | -38.02 |
| 2.19   | 100.00    | -43.89         | -94.55      | -38.44 |
| 2.25   | 100.00    | -41.93         | -97.03      | -38.95 |
| 2.32   | 100.00    | -40.05         | -99.50      | -39.55 |
| 2.39   | 100.00    | -38.26         | -101.98     | -40.24 |
| 2.45   | 100.00    | -36.55         | -104.45     | -41.00 |
| 2.52   | 100.00    | -34.92         | -106.93     | -41.84 |
| 2.58   | 100.00    | -33.36         | -109.40     | -42.76 |
| 2.65   | 100.00    | -31.86         | -111.88     | -43.74 |
| 2.72   | 100.00    | -30.44         | -114.35     | -44.79 |
| 2.78   | 100.00    | -29.08         | -116.83     | -45.90 |
| 2.85   | 100.00    | -27.78         | -119.30     | -47.08 |
| 2.91   | 100.00    | -26.54         | -121.78     | -48.31 |

![Example 1](https://raw.githubusercontent.com/SaitoTech/saito/master/docs/whitepaper/svgs/ex1.svg?sanitize=true)

For all sets of parameters set we can see that while there is an optimal number of golden tickets per block to mine, this optimum still fails to return to the attacker more than they are spending.



