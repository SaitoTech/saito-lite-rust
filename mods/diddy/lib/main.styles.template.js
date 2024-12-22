module.exports = () => {
    return `
    <style class="main-styles-container">

    /* General Reset */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
        color: #fff;
    }

    /* Body and HTML Background */
    html, body {
        background: radial-gradient(circle, #555, #333); /* Grey background */
        height: 100%;
        margin: 0;
    }

    body {
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        padding: 20px;
    }

    /* Overlay Header Styling */
    .overlay-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background-color: #222; /* Grey background for the header */
        z-index: 10000; /* Ensure the header is on top */
    }

    /* Main Container Styling */
    .main-container {
        text-align: center;
        max-width: 400px;
        width: 100%;
        background-color: #222;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        margin-top: 70px; /* Adds space below the header */
        z-index: 1; /* Ensure it doesn't overlap the header */
    }

    /* Wallet Button Styling */
    .wallet-button-container {
        position: relative;
        margin-top: 20px;
        text-align: center;
    }

    .wallet-style {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(45deg, #FFD700, #FFA500);
        border-radius: 10px;
        padding: 10px 20px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .wallet-style:hover {
        opacity: 0.9;
    }

    /* Lightning Icon Styling */
    .lightning-icon img {
        width: 2rem;
        height: 2rem;
        object-fit: contain;
        margin-right: 4px;
        vertical-align: middle;
    }

    /* Top Bar Styling */
    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #333;
        border-radius: 20px;
        padding: 10px;
        margin-bottom: 15px;
    }

    .top-bar-coin-icon {
        width: 50px;
        height: 50px;
        object-fit: contain;
    }

    .top-bar-label {
        text-align: left;
        color: #FFD700;
    }

    .game-name {
        font-weight: bold;
        display: block;
    }

    .level {
        font-size: 2rem;
        font-weight: bold;
        text-shadow: 0px 0px 5px rgba(255, 215, 0, 0.8);
    }

    /* Per Tap Button */
    .per-tap-button {
        background: #444;
        border-radius: 10px;
        padding: 5px 10px;
        color: #FFD700;
        font-weight: bold;
    }

    /* Game Stats Section */
    .game-stats {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        margin-bottom: 10px;
    }

    .coin-display {
        width: 50px;
        height: 50px;
        object-fit: contain;
        margin-bottom: 5px;
    }

    .text-number {
        font-size: 2rem;
        color: #FFD700;
        text-shadow: 0px 0px 5px rgba(255, 215, 0, 0.8);
        font-weight: bold;
    }

    /* Character Image */
    .character-image {
        width: 300px;
        height: 300px;
        border-radius: 50%;
        object-fit: cover;
        cursor: pointer;
        display: block;
        margin: 20px auto;
    }

    /* Score Bar */
    .score-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: #FFD700;
        margin-top: 10px;
    }

    /* Remove message-wrapper */
    #message-wrapper {
        display: none !important;
    }

    </style>
    `;
};
