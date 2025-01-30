document.addEventListener("DOMContentLoaded", async () => {
    const tokenListElement = document.getElementById("token-list");

    // Extract token addresses for API request
    const tokenAddresses = tokens.map(token => token.address).join(",");

    // Fetch token prices from GeckoTerminal API
    const apiUrl = `https://api.geckoterminal.com/api/v2/simple/networks/bitrock/token_price/${tokenAddresses}?include_market_cap=true&include_24hr_vol=true`;

    try {
        const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
        const data = await response.json();
        const tokenPrices = data.data.attributes.token_prices;

        // Loop through tokens and display them
        tokens.forEach(token => {
            const price = tokenPrices[token.address] || "N/A";

            // Create token list item
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <img src="${token.image}" alt="Token Image">
                <div class="token-info">
                    <strong>Address:</strong> ${token.address} <br>
                    <strong>Price:</strong> $${parseFloat(price).toFixed(6)}
                </div>
                <div class="links">
                    <a href="${token.website}" target="_blank">Website</a>
                    <a href="${token.telegram}" target="_blank">Telegram</a>
                    <a href="${token.twitter}" target="_blank">Twitter</a>
                </div>
            `;
            tokenListElement.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching token prices:", error);
    }
});
