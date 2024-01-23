const questions = [
	{
		question: 'What layer is Saito blockchain?',
		answers: [
			{
				answer: 'Layer 1 blockchain',
				correct: true
			},
			{
				answer: 'Layer 2 blockchain',
				correct: false
			},
			{
				answer: 'Layer 3 blockchain',
				correct: false
			}
		]
	},
	{
		question: 'What type of consensus does Saito blockchain use?',
		answers: [
			{
				answer: 'Proof of work',
				correct: false
			},
			{
				answer: 'Proof of stake',
				correct: false
			},
			{
				answer: 'Saito consensus',
				correct: true
			}
		]
	},
	{
		question: 'What key problem in blockchain space Saito solves?',
		answers: [
			{
				answer: 'Blockchain trilemma',
				correct: true
			},
			{
				answer: 'Blockchain dilemma',
				correct: false
			},
			{
				answer: 'Miner Extractable Value (MEV)',
				correct: false
			}
		]
	},
	{
		question: 'What Roald Dahl reference is embedded in Saito Consensus?',
		answers: [
			{
				answer: 'The Golden Ticket',
				correct: true
			},
			{
				answer: 'The Glass Elevator',
				correct: false
			},
			{
				answer: 'The Universal Validator',
				correct: false
			}
		]
	},
	{
		question: 'What is the smallest denomination of Saito called?',
		answers: [
			{
				answer: 'A Nolan',
				correct: true
			},
			{
				answer: 'A Watanabe',
				correct: false
			},
			{
				answer: 'A Bale',
				correct: false
			}
		]
	},
	{
		question: 'Who is a free rider in Blockchain?',
		answers: [
			{
				answer: 'Someone who socializes losses and privatizes gains',
				correct: true
			},
			{
				answer: 'Someone who does not stake their tokens',
				correct: false
			},
			{
				answer: 'Someone who pays low fees',
				correct: false
			}
		]
	},
	{
		question: 'Saito Consensus pays for?',
		answers: [
			{
				answer: 'Collecting and Routing Transactions',
				correct: true
			},
			{
				answer: 'Free-riding on Volunteers',
				correct: false
			},
			{
				answer: 'Foisting hard work on Infura',
				correct: false
			}
		]
	},
	{
		question: 'What did Saito get a grant from Web3 Foundation for?',
		answers: [
			{
				answer: 'Peer-to-Peer Gaming Protocol',
				correct: true
			},
			{
				answer: 'Saito Consensus',
				correct: false
			},
			{
				answer: 'Peer-to-Peer Web3 Toolkit',
				correct: false
			}
		]
	},
	{
		question: 'What was the first game on the Saito Arcade?',
		answers: [
			{
				answer: 'Chess',
				correct: true
			},
			{
				answer: 'Wordblocks',
				correct: false
			},
			{
				answer: 'Twilight Struggle',
				correct: false
			}
		]
	},
	{
		question: 'Is Saito a UTXO blockchain?',
		answers: [
			{
				answer: 'Yes',
				correct: true
			},
			{
				answer: 'No',
				correct: false
			},
			{
				answer: 'Maybe',
				correct: false
			}
		]
	},
	{
		question:
			'Which is one of the two economic problems in blockchain design the Saito whitepaper discusses?',
		answers: [
			{
				answer: 'Tragedy of the Commons',
				correct: true
			},
			{
				answer: 'Prisoners\' Dilemma',
				correct: false
			},
			{
				answer: 'Sorites Paradox',
				correct: false
			}
		]
	},
	{
		question: 'What does the ATR stand for within Saito?',
		answers: [
			{
				answer: 'Automatic Transaction Rebroadcasting',
				correct: true
			},
			{
				answer: 'Authenticated Transaction Routing',
				correct: false
			},
			{
				answer: 'Abandoned Transient Route',
				correct: false
			}
		]
	},
	{
		question: 'What does ATR achieve?',
		answers: [
			{
				answer: 'Permanent data on a transient ledger',
				correct: true
			},
			{
				answer: 'Prevents miners from duplicating transactions due to authentication',
				correct: false
			},
			{
				answer: 'Transient data on a permanent ledger',
				correct: false
			}
		]
	},
	{
		question:
			'Saito’s founding team holds various patents. What was the first thing patented by a Saito founder?',
		answers: [
			{
				answer: 'Scientific paper rating system',
				correct: true
			},
			{
				answer: 'Recipe recommendation engine',
				correct: false
			},
			{
				answer: 'Academic Authoring tool',
				correct: false
			}
		]
	},
	{
		question:
			'Where did the team get the inspiration for the name “Saito” from?',
		answers: [
			{
				answer: 'A movie character (Inception)',
				correct: true
			},
			{
				answer: 'San Andres Island Tours by Ocean',
				correct: false
			},
			{
				answer: 'Aikido master Morihiro Saito ',
				correct: false
			}
		]
	},
	{
		question: 'When did the first prototype of the network go live?',
		answers: [
			{
				answer: '2018',
				correct: true
			},
			{
				answer: '2020',
				correct: false
			},
			{
				answer: '2021',
				correct: false
			}
		]
	},
	{
		question: 'What is Saito\'s theoretical max supply?',
		answers: [
			{
				answer: '10 B',
				correct: true
			},
			{
				answer: '20 B',
				correct: false
			},
			{
				answer: '3 B',
				correct: false
			}
		]
	},
	{
		question: 'Saito network intended to be...',
		answers: [
			{
				answer: 'Inflationary',
				correct: false
			},
			{
				answer: 'Deflationary',
				correct: false
			},
			{
				answer: 'Neither',
				correct: true
			}
		]
	},
	{
		question: 'What is Saito’s social network called?',
		answers: [
			{
				answer: 'Red Square',
				correct: true
			},
			{
				answer: 'Saitown',
				correct: false
			},
			{
				answer: 'Saito Space',
				correct: false
			}
		]
	},
	{
		question: 'What is the Saito game engine called?',
		answers: [
			{
				answer: 'Saito Game Engine (SaGE)',
				correct: true
			},
			{
				answer: 'Saito Arcade Engine (SAE)',
				correct: false
			},
			{
				answer: 'Saito Network Game Engine (SNGE)',
				correct: false
			}
		]
	},
	{
		question: 'What are the two primary design goals of Saito blockchain?',
		answers: [
			{
				answer: 'Openness and self-sufficiency',
				correct: true
			},
			{
				answer: 'Low power consumption and high scalability.',
				correct: false
			},
			{
				answer: 'Low transaction fees and high speed.',
				correct: false
			}
		]
	},
	{
		question:
			'How does Saito use a \'fee market\' to incentivize nodes to process transactions?',
		answers: [
			{
				answer: 'By creating a competitive market between old and new data',
				correct: true
			},
			{
				answer: 'By auctioning off transaction processing rights to the highest bidder.',
				correct: false
			},
			{
				answer: 'By charging higher transaction fees for larger transactions.',
				correct: false
			}
		]
	},
	{
		question:
			'How does Saito incentivize nodes to rebroadcast transactions?',
		answers: [
			{
				answer: 'By making rebroadcasting part of block creation and validation',
				correct: true
			},
			{
				answer: 'By punishing nodes that do not rebroadcast.',
				correct: false
			},
			{
				answer: 'By offering a monetary reward for each rebroadcast.',
				correct: false
			}
		]
	},
	{
		question:
			'What is the difference between a \'full node\' and a \'lite node\' in Saito blockchain?',
		answers: [
			{
				answer: 'Full nodes process complete blocks, lite-nodes process SPV blocks',
				correct: true
			},
			{
				answer: 'Full nodes run all network applications, lite-node run and validate only a subset',
				correct: false
			},
			{
				answer: 'Full nodes index historical blocks, lite-nodes prune them after rebroadcasting',
				correct: false
			}
		]
	},
	{
		question: 'How does Saito solve the \'scalability trilemma\'?',
		answers: [
			{
				answer: 'By generating cost-of-attack payments that flow to nodes in the network',
				correct: true
			},
			{
				answer: 'By using a fee market to regulate transaction volume.',
				correct: false
			},
			{
				answer: 'By prioritizing transaction processing based on the importance of the transaction.',
				correct: false
			}
		]
	},
	{
		question:
			'At what percentage of network control can an attacker execute a profitable attack?',
		answers: [
			{
				answer: '100 percent or more',
				correct: true
			},
			{
				answer: '34 percent',
				correct: false
			},
			{
				answer: '51 percent',
				correct: false
			}
		]
	},
	{
		question: 'How does Saito prevent double-spending?',
		answers: [
			{
				answer: 'Through the use of a distributed ledger',
				correct: true
			},
			{
				answer: 'By requiring staking',
				correct: false
			},
			{
				answer: 'By implementing a fee market',
				correct: false
			}
		]
	},
	{
		question:
			'Which cryptographic method does Saito use to generate a shared-secret between peers over the blockchain?',
		answers: [
			{
				answer: 'Diffie-Hellman Key Exchange',
				correct: true
			},
			{
				answer: 'Byzantine Peer Coupling',
				correct: false
			},
			{
				answer: 'RSA Double-Passing',
				correct: false
			}
		]
	},
	{
		question: 'How are Saito blocks organized?',
		answers: [
			{
				answer: 'As a linked list',
				correct: true
			},
			{
				answer: 'As a hash table',
				correct: false
			},
			{
				answer: 'As a binary tree',
				correct: false
			}
		]
	},
	{
		question:
			'What is the main problem with the transaction fee distribution model in POW / POS?',
		answers: [
			{
				answer: 'it does not reflect real-world costs',
				correct: true
			},
			{
				answer: 'it is too complex',
				correct: false
			},
			{
				answer: 'It is too expensive',
				correct: false
			}
		]
	},
	{
		question: 'How are Saito transactions structured within the block?',
		answers: [
			{
				answer: 'In a merkle tree',
				correct: true
			},
			{
				answer: 'As a binary tree',
				correct: false
			},
			{
				answer: 'As a linked list',
				correct: false
			}
		]
	},
	{
		question:
			'What is not a key innovation introduced by the Saito network?',
		answers: [
			{
				answer: 'peer-to-peer universal broadcast',
				correct: true
			},
			{
				answer: 'automatic transaction',
				correct: false
			},
			{
				answer: 'golden ticket lottery',
				correct: false
			}
		]
	},
	{
		question:
			'Saito uses the most performance data-structure for UTXO storage. What is that?',
		answers: [
			{
				answer: 'in-memory hashmap',
				correct: true
			},
			{
				answer: 'noDB databases',
				correct: false
			},
			{
				answer: 'spv archive technology',
				correct: false
			}
		]
	},
	{
		question:
			'One of the games on the Saito Arcade was once a top-10 Ranked Boardgame on BoardGameGeeks. Which game?',
		answers: [
			{
				answer: 'Twilight Struggle',
				correct: true
			},
			{
				answer: 'Red Imperium',
				correct: false
			},
			{
				answer: 'Wordblocks',
				correct: false
			}
		]
	},
	{
		question:
			'Which type of nodes are rewarded with SAITO tokens for relaying transactions on the Saito network?',
		answers: [
			{
				answer: 'Routing nodes',
				correct: true
			},
			{
				answer: 'Mining nodes',
				correct: false
			},
			{
				answer: 'Validation nodes',
				correct: false
			}
		]
	},
	{
		question: 'Which problem does the Saito blockchain aim to solve?',
		answers: [
			{
				answer: 'Value Measurement',
				correct: true
			},
			{
				answer: 'The prisoners’ dilemma',
				correct: false
			},
			{
				answer: 'The double-spending problem',
				correct: false
			}
		]
	},
	{
		question: 'What is the maximum block size of the Saito blockchain?',
		answers: [
			{
				answer: 'Unlimited',
				correct: true
			},
			{
				answer: '1 MB',
				correct: false
			},
			{
				answer: '2 MB',
				correct: false
			}
		]
	},
	{
		question: 'Why is the UTXO model superior to POS-style account?',
		answers: [
			{
				answer: 'faster chain winding / unwinding',
				correct: true
			},
			{
				answer: 'harder to charge rent',
				correct: false
			},
			{
				answer: 'easier balance storage',
				correct: false
			}
		]
	},
	{
		question:
			'What is the role of the users in the network governance protocol?',
		answers: [
			{
				answer: 'determining first-hop relay nodes',
				correct: true
			},
			{
				answer: 'voting on changes to the blockchain protocol',
				correct: false
			},
			{
				answer: 'choosing the set of network validators',
				correct: false
			}
		]
	},
	{
		question: 'What is the purpose of the Saito golden ticket mechanism?',
		answers: [
			{
				answer: 'To ensure there is always cost-of-attack on the network',
				correct: true
			},
			{
				answer: 'To separate block production from hashing costs',
				correct: false
			},
			{
				answer: 'To increase transaction throughput',
				correct: false
			}
		]
	},
	{
		question: 'How does Saito prevent transaction spam?',
		answers: [
			{
				answer: 'no transaction paying the market price is considered spam',
				correct: true
			},
			{
				answer: 'by using a separate quota-system for transaction throughput',
				correct: false
			},
			{
				answer: 'on-chain governance',
				correct: false
			}
		]
	},
	{
		question: 'How does Saito ensure transaction finality?',
		answers: [
			{
				answer: 'By using Automatic Transaction Rebroadcasting',
				correct: true
			},
			{
				answer: 'By using a leader-based consensus algorithm',
				correct: false
			},
			{
				answer: 'By using a Nakamoto consensus algorithm',
				correct: false
			}
		]
	},
	{
		question: 'What is the purpose of the Saito Whitepaper?',
		answers: [
			{
				answer: 'To describe the technical details of the Saito blockchain',
				correct: true
			},
			{
				answer: 'To promote the Saito network to potential investors',
				correct: false
			},
			{
				answer: 'To provide a user manual for the Saito platform',
				correct: false
			}
		]
	},
	{
		question:
			'What is the school of economics concerned with the scalability problems in blockchain?',
		answers: [
			{
				answer: 'public choice',
				correct: true
			},
			{
				answer: 'macroeconomics',
				correct: false
			},
			{
				answer: 'microeconomics',
				correct: false
			}
		]
	},
	{
		question:
			'What are the technical terms in economics that best describe openness?',
		answers: [
			{
				answer: 'non-excludability',
				correct: true
			},
			{
				answer: 'rate-limitless',
				correct: false
			},
			{
				answer: 'transparency',
				correct: false
			}
		]
	},
	{
		question:
			'How does Saito ensure that the network remains decentralized?',
		answers: [
			{
				answer: 'By putting users in charge of first-hop routing nodes',
				correct: true
			},
			{
				answer: 'By limiting the number of nodes that can participate in consensus',
				correct: false
			},
			{
				answer: 'By incentivizing users to run full nodes',
				correct: false
			}
		]
	},
	{
		question: 'What is the fee-recycling attack?',
		answers: [
			{
				answer: 'using the reward from one block to pay for the costs of producing the next',
				correct: true
			},
			{
				answer: 'padding blocks with fake transactions to increase overall fee levels',
				correct: false
			},
			{
				answer: 'sending transactions back-and-forth between wallets to spam the network',
				correct: false
			}
		]
	},
	{
		question:
			'How does Saito ensure that blocks are propagated quickly throughout the network?',
		answers: [
			{
				answer: 'by self-optimizing the routing network',
				correct: true
			},
			{
				answer: 'by requiring nodes to solve a cryptographic puzzle',
				correct: false
			},
			{
				answer: 'by slashing block withholding',
				correct: false
			}
		]
	},
	{
		question:
			'What novel property do key exchanges get running atop Saito?',
		answers: [
			{
				answer: 'eliminates man-in-the-middle attacks',
				correct: true
			},
			{
				answer: 'extendible to more than two parties',
				correct: false
			},
			{
				answer: 'faster key-exchange from existing keys',
				correct: false
			}
		]
	},
	{
		question: 'What is the main advantage of Saito\'s \'economic\' solution?',
		answers: [
			{
				answer: 'it eliminates technical problems by eliminating the trade-offs that create them',
				correct: true
			},
			{
				answer: 'it provides a different set of trade-offs more conducive to scale',
				correct: false
			},
			{
				answer: 'it fulfills all of Hayek\'s five properties for \'digital gold\'',
				correct: false
			}
		]
	},
	{
		question:
			'How does Saito solve the \'Tragedy of the Commons\' problem in permanent ledgers?',
		answers: [
			{
				answer: 'force block producers to do work before receiving payment',
				correct: true
			},
			{
				answer: 'impose a limit on the number of transactions',
				correct: false
			},
			{
				answer: 'require validators to provide stake that can be slashed',
				correct: false
			}
		]
	},
	{
		question:
			'What three structures can free markets use to defeat free-riding pressures in blockchain networks?',
		answers: [
			{
				answer: 'Monopolization, privatization, and cartelization',
				correct: true
			},
			{
				answer: 'Decentralization, security, and scalability',
				correct: false
			},
			{
				answer: 'Proof of work, proof of stake, and delegated proof of stake',
				correct: false
			}
		]
	},
	{
		question:
			'What is a problem with asking outside markets to incentivize P2P network provision?',
		answers: [
			{
				answer: 'users will collude with edge-nodes to monetize the existing fee, defunding network security',
				correct: true
			},
			{
				answer: 'security will drop if monopolies are responsible for most mining / staking',
				correct: false
			},
			{
				answer: 'nodes will not be able to charge users for services',
				correct: false
			}
		]
	},
	{
		question: 'How are fees collected in the Saito Consensus?',
		answers: [
			{
				answer: 'They are burned and then resurrected in a payment lottery system',
				correct: true
			},
			{
				answer: 'They are distributed evenly among all nodes in the network',
				correct: false
			},
			{
				answer: 'They are paid directly to the miners who produce the blocks',
				correct: false
			}
		]
	},
	{
		question:
			'What happens to the fees in a block if the very next block does not contain a golden ticket and our difficulty mechanism is targeting one solution every two blocks?',
		answers: [
			{
				answer: 'It depends on what happens in the next block',
				correct: true
			},
			{
				answer: 'The miner payout is collected by the stalking table, the routing payout may happen next block',
				correct: false
			},
			{
				answer: '100% of the fees are collected for the staking table',
				correct: false
			}
		]
	},
	{
		question:
			'How does Saito Consensus differ from other consensus mechanisms in terms of cost-of-attack?',
		answers: [
			{
				answer: 'Cost-of-attack is well above 100% of the fee throughput of the network',
				correct: true
			},
			{
				answer: 'The cost-of-attack is capped at 51% of fee throughput',
				correct: false
			},
			{
				answer: 'For-profit attacks on consensus are always possible through collusion among participants',
				correct: false
			}
		]
	},
	{
		question:
			'What is the purpose of adjusting mining difficulty in the Saito Consensus?',
		answers: [
			{
				answer: 'To target 1 golden ticket every 2 blocks',
				correct: true
			},
			{
				answer: 'To reduce the overall cost of operating the network',
				correct: false
			},
			{
				answer: 'To make it easier for miners to produce blocks',
				correct: false
			}
		]
	},
	{
		question:
			'What happens to the payment for both miner and router if the block reward is seriously in excess of the smoothed average?',
		answers: [
			{
				answer: 'The payment is reduced proportionally and the excess portion is burned for good',
				correct: true
			},
			{
				answer: 'The payment is increased to encourage more miners to join the network',
				correct: false
			},
			{
				answer: 'The excess portion is redistributed among all nodes in the network',
				correct: false
			}
		]
	},
	{
		question:
			'Why doesn\'t giving a transaction to another node allow it to compete with you producing blocks?',
		answers: [
			{
				answer: 'because the receiving node gets less \'work\' from the transaction and still has a payment obligation to the sending node',
				correct: true
			},
			{
				answer: 'because the receiving node cannot make a block with this transaction',
				correct: false
			},
			{
				answer: 'of course it does, this is why routing work will never work',
				correct: false
			}
		]
	},
	{
		question:
			'What happens to the profitability of routing nodes when they hoard transactions?',
		answers: [
			{
				answer: 'It decreases',
				correct: true
			},
			{
				answer: 'It stays the same',
				correct: false
			},
			{
				answer: 'It increases',
				correct: false
			}
		]
	},
	{
		question:
			'What incentive does a first-hop node have to broadcast a fee-bearing transaction it wants to include in the blockchain?',
		answers: [
			{
				answer: 'it earns nothing if a competitor includes the transaction first',
				correct: true
			},
			{
				answer: 'transaction hoarding is the Nash Equilibrium in all routing networks',
				correct: false
			},
			{
				answer: 'sharing is needed to keep the network decentralized',
				correct: false
			}
		]
	},
	{
		question: 'What is the main difference between Bitcoin and Saito?',
		answers: [
			{
				answer: 'Saito does not have economic attacks',
				correct: true
			},
			{
				answer: 'Saito only handles monetary transactions',
				correct: false
			},
			{
				answer: 'Saito can handle arbitrary data in addition to monetary transactions',
				correct: false
			}
		]
	},
	{
		question: 'What is the goal of Saito?',
		answers: [
			{
				answer: 'To become a commercially-scalable public blockchain',
				correct: true
			},
			{
				answer: 'To create a new smart contract platform to compete with Ethereum',
				correct: false
			},
			{
				answer: 'To replace centralized internet service providers (ISP\'s) with its own nodes',
				correct: false
			}
		]
	},
	{
		question:
			'What is the benefit of using Saito for data transfers instead of web2 platforms?',
		answers: [
			{
				answer: 'universal broadcast with guaranteed cost-of-attack on reversibility',
				correct: true
			},
			{
				answer: 'the blockchain provides free data storage, web2 firms need to pay for data storage',
				correct: false
			},
			{
				answer: 'Saito has a more user-friendly interface than web2 platforms',
				correct: false
			}
		]
	},
	{
		question: 'How does Saito eliminate closure?',
		answers: [
			{
				answer: 'by making sharing fees and data the most profitable strategic option',
				correct: true
			},
			{
				answer: 'by charging lower fees than centralized platforms',
				correct: false
			},
			{
				answer: 'by requiring all users to run nodes on the network',
				correct: false
			}
		]
	},
	{
		question: 'What kind of data can Saito transactions carry?',
		answers: [
			{
				answer: 'Any type of data, including messages, emails, videos, and IOT data',
				correct: true
			},
			{
				answer: 'Only monetary transactions',
				correct: false
			},
			{
				answer: 'Only social media posts and personal information',
				correct: false
			}
		]
	},
	{
		question: 'How does Saito handle off-chain software?',
		answers: [
			{
				answer: 'Off-chain software can listen to the chain and react accordingly',
				correct: true
			},
			{
				answer: 'Off-chain software is not compatible with Saito',
				correct: false
			},
			{
				answer: 'Off-chain software must be run on a centralized server',
				correct: false
			}
		]
	},
	{
		question: 'What is the Saito team\'s stance on third-party nodes?',
		answers: [
			{
				answer: 'Welcome if they drive transaction volume',
				correct: true
			},
			{
				answer: 'Will not be allowed until token persistence is active',
				correct: false
			},
			{
				answer: 'Will never be allowed on the Saito network',
				correct: false
			}
		]
	},
	{
		question:
			'What is the Saito team\'s stance on scheduled network upgrades?',
		answers: [
			{
				answer: 'Willing to work with third-party nodes on upgrades',
				correct: true
			},
			{
				answer: 'Not willing to work with third-party nodes on upgrades',
				correct: false
			},
			{
				answer: 'Neutral on the subject',
				correct: false
			}
		]
	}
];

export function getRandomQuestion() {
	const correctAnswerPlacement = Math.floor(Math.random() * 3); // 0,1,2
	const questionIndex = Math.floor(Math.random() * questions.length);
	let correctAnswerIndex = 0;
	for (
		let index = 0;
		index < questions[questionIndex].answers.length;
		index++
	) {
		if (questions[questionIndex].answers[index].correct) {
			correctAnswerIndex = index;
			break;
		}
	}
	let rearrangedAnswers = [];
	let availableAnswers = [0, 1, 2];
	availableAnswers.splice(correctAnswerIndex, 1);
	for (
		let index = 0;
		index < questions[questionIndex].answers.length;
		index++
	) {
		if (correctAnswerPlacement === index) {
			rearrangedAnswers.push(
				questions[questionIndex].answers[correctAnswerIndex]
			);
		} else {
			rearrangedAnswers.push(
				questions[questionIndex].answers[availableAnswers[0]]
			);
			availableAnswers.splice(0, 1);
		}
	}
	const randomQuestion = {
		question: questions[questionIndex].question,
		answers: rearrangedAnswers,
		correctAnswerIndex: correctAnswerPlacement
	};
	return randomQuestion;
}
