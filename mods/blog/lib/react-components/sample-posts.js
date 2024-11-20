export const samplePosts = [
  {
      sig: "post4",
      title: "Second ATR Cycle and Rewards",
      author: "StackTooDeep@saito",
      publicKey: "vyMNHWAi8osp5UYmiCjVPnpqnNTWrkQbHuNScsy1gt8t_1",
      timestamp: Date.now() - 86400000, // 1 day ago
      image: "https://saito.tech/wp-content/uploads/2024/10/ATR_5APY_1200x6302.png", // Featured image
      content: `
  ![Blockchain Technology])
  
  Blockchain technology is revolutionizing the way we think about digital transactions and data storage. In this comprehensive guide, we'll explore the fundamental concepts that make blockchain unique and powerful.
  
  ## Key Concepts
  
  1. **Decentralization**: Unlike traditional systems, blockchain operates without a central authority
  2. **Immutability**: Once data is recorded, it cannot be altered
  3. **Transparency**: All transactions are visible to network participants
  
  Let's dive deeper into each of these concepts and understand how they work together to create a robust and secure system.
  
  ### Real-World Applications
  
  - Digital currencies
  - Smart contracts
  - Supply chain management
  - Digital identity verification
  
  Stay tuned for more in-depth analysis of each application!
  `,
      likes: 156,
      comments: 23,
      shares: 0
    },
    {
      sig: "post5",
      title: "Saito Summer 11",
      author: "CryptoNinja@saito",
      publicKey: "vyMNHWAi8osp5UYmiCjVPnpqnNTWrkQbHuNScsy1gt8t_2",
      timestamp: Date.now() - 172800000, // 2 days ago
      image: "https://saito.tech/wp-content/uploads/2024/10/his-board-scaled-2048x1325.jpg",
      content: `
  ![Gaming Metaverse])
  
  The gaming industry is witnessing a paradigm shift with the integration of blockchain technology. Web3 gaming is not just about playing; it's about owning your in-game assets and being part of a decentralized gaming ecosystem.
  
  ## Major Trends
  
  - **Play-to-Earn Models**
  - **NFT Integration**
  - **Cross-Platform Compatibility**
  - **Decentralized Gaming Communities**
  
  ### Current Challenges
  
  Despite the exciting possibilities, several challenges need to be addressed:
  
  1. Scalability issues
  2. User experience
  3. Regulatory compliance
  
  Join us next week for an in-depth analysis of successful Web3 games!
  `,
      likes: 234,
      comments: 45,
      shares: 0
    },
    {
      sig: "post9",
      title: "Don’t Trust Us; One-click P2P Encrypted Chat and Video Call on Saito",
      author: "BlockchainBoss@saito",
      publicKey: "vyMNHWAi8osp5UYmiCjVPnpqnNTWrkQbHuNScsy1gt8t_3",
      timestamp: Date.now() - 259200000, // 3 days ago
      image: "",
      content: `
  ![DeFi Farming])
  
  Yield farming continues to be one of the most popular ways to earn passive income in the DeFi space. Today, we'll explore some effective strategies that can help maximize your returns while managing risks.
  
  ## Popular Strategies
  
  1. **Liquidity Providing**
     - Choose stable pairs
     - Monitor impermanent loss
     - Leverage yield aggregators
  
  2. **Staking**
     - Single-sided staking
     - LP token staking
     - Governance token staking
  
  ### Risk Management
  
  Always remember:
  - Diversify your portfolio
  - Audit smart contracts
  - Monitor market conditions
  - Set realistic expectations
  
  *Not financial advice. Always do your own research.*
  `,
      likes: 189,
      comments: 34,
      shares: 0
    },
    {
      sig: "post9",
      title: "Don’t Trust Us; One-click P2P Encrypted Chat and Video Call on Saito. More title post content to fill up space",
      author: "BlockchainBoss@saito",
      publicKey: "vyMNHWAi8osp5UYmiCjVPnpqnNTWrkQbHuNScsy1gt8t_3",
      timestamp: Date.now() - 259200000, // 3 days ago
      image: "",
      content: `
  ![DeFi Farming])
  
  Yield farming continues to be one of the most popular ways to earn passive income in the DeFi space. Today, we'll explore some effective strategies that can help maximize your returns while managing risks.
  
  ## Popular Strategies
  
  1. **Liquidity Providing**
     - Choose stable pairs
     - Monitor impermanent loss
     - Leverage yield aggregators
  
  2. **Staking**
     - Single-sided staking
     - LP token staking
     - Governance token staking
  
  ### Risk Management
  
  Always remember:
  - Diversify your portfolio
  - Audit smart contracts
  - Monitor market conditions
  - Set realistic expectations
  
  *Not financial advice. Always do your own research.*
  `,
      likes: 189,
      comments: 34,
      shares: 0
    },
    {
      sig: "post6",
      title: "Saito Summer 13 – LCX Listing and Tech Update",
      author: "David@saito",
      publicKey: "vyMNHWAi8osp5UYmiCjVPnpqnNTWrkQbHuNScsy1gt8t_4",
      timestamp: Date.now() - 345600000, // 4 days ago
      image: "",
      content: `
  ![Decentralized Social])
  
  Decentralized social media platforms are emerging as alternatives to traditional centralized networks. Let's explore the technical architecture behind these platforms.
  
  ## Core Components
  
  \`\`\`javascript
  class SocialNetwork {
    constructor() {
      this.users = new DecentralizedStorage();
      this.posts = new ContentAddressableStore();
      this.relationships = new Graph();
    }
  }
  \`\`\`
  
  ### Key Features
  
  1. **Data Ownership**
  2. **Content Persistence**
  3. **Identity Management**
  4. **Privacy Controls**
  
  Stay tuned for part 2 where we'll implement these components!
  `,
      likes: 145,
      comments: 28,
      shares: 0
    },
    {
      sig: "post7",
      title: "Saito Fileshare – Unlimited, P2P, Encrypted",
      author: "Richard@saito",
      publicKey: "vyMNHWAi8osp5UYmiCjVPnpqnNTWrkQbHuNScsy1gt8t_5",
      timestamp: Date.now() - 432000000, // 5 days ago
      image: "https://saito.tech/wp-content/uploads/2024/07/saito-summer-banner.jpg",
      content: `
  ![Smart Contract Security])
  
  Security is paramount when developing smart contracts. A single vulnerability can lead to substantial financial losses. Here's a comprehensive guide to securing your smart contracts.
  
  ## Common Vulnerabilities
  
  \`\`\`solidity
  // Vulnerable code
  function withdraw(uint amount) public {
      require(balance[msg.sender] >= amount);
      msg.sender.call.value(amount)("");
      balance[msg.sender] -= amount;
  }
  
  // Secure code
  function withdraw(uint amount) public {
      require(balance[msg.sender] >= amount);
      balance[msg.sender] -= amount;
      msg.sender.call.value(amount)("");
  }
  \`\`\`
  
  ### Security Checklist
  
  - [ ] Implement access controls
  - [ ] Use SafeMath library
  - [ ] Add emergency stops
  - [ ] Conduct thorough testing
  - [ ] Get professional audits
  
  Remember: Security is not a feature, it's a process.
  `,
      likes: 267,
      comments: 56,
      shares: 0
    }

  ]