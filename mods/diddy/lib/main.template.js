module.exports = () => {
    return `
    <div class="main-container">
        <!-- Top Bar with Coin Icon Image, Game Name, Level, and Per Tap Button -->
        <div class="top-bar">
            <img src="img/coins.png" alt="Coins Icon" class="top-bar-coin-icon">
            <div class="top-bar-label">
                <span class="game-name">$DIDDY</span>
                <span class="level" id="level">Level 1</span>
            </div>
            <div class="per-tap-button">
                <span>Per tap</span>
                <span>+1</span>
            </div>
        </div>

        <!-- Game Stats Section with SoloCoin Image -->
        <section class="game-stats">
            <img src="img/solocoin.png" alt="Solo Coin Icon" class="coin-display">
            <h1 class="text-number" id="score">0</h1>
        </section>

        <!-- Character Icon - Only Image is Clickable -->
        <img src="img/Untitled design (17).png" alt="Character Icon" class="character-image" id="character-image" style="touch-action: manipulation;">

        <!-- Energy/Score Bar Section -->
        <section class="score-bar">
            <div class="lightning-icon">
                <img src="img/lightning.png" alt="Lightning Icon" class="custom-icon">
            </div>
            <span id="energy">0 / 1,000,000</span>
        </section>

        <!-- Wallet Button with Text -->
        <div class="wallet-button-container">
            <div class="wallet-style">
                <span>Open Wallet</span>
            </div>
        </div>
    </div>
    <script>
        // Apply a radial-gradient background to the html element
        window.onload = () => {
            document.documentElement.style.background = "radial-gradient(circle, #555, #333)";
            document.documentElement.style.height = "100%"; // Ensure it covers the full viewport
        };
    </script>
    `;
};
