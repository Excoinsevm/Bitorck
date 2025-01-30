document.addEventListener("DOMContentLoaded", () => {
    const tokenListElement = document.getElementById("token-list");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");

    const tokensPerPage = 30;
    let currentPage = getQueryParam("page") || 1;
    const totalPages = Math.ceil(tokens.length / tokensPerPage);

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get(param)) || null;
    }

    function updatePagination() {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
    }

    async function loadTokens() {
        tokenListElement.innerHTML = "<p>Loading...</p>";

        // Get tokens for the current page
        const startIdx = (currentPage - 1) * tokensPerPage;
        const paginatedTokens = tokens.slice(startIdx, startIdx + tokensPerPage);

        if (paginatedTokens.length === 0) {
            tokenListElement.innerHTML = "<p>No tokens available.</p>";
            return;
        }

        // Fetch token prices
        const tokenAddresses = paginatedTokens.map(token => token.address).join(",");
        const apiUrl = `https://api.geckoterminal.com/api/v2/simple/networks/bitrock/token_price/${tokenAddresses}?include_market_cap=true&include_24hr_vol=true`;

        try {
            const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
            const data = await response.json();
            const tokenPrices = data.data.attributes.token_prices;

            tokenListElement.innerHTML = ""; // Clear list

            // Loop through paginated tokens and display
            paginatedTokens.forEach(token => {
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
            tokenListElement.innerHTML = "<p>Error loading token data.</p>";
        }

        updatePagination();
    }

    function changePage(newPage) {
        currentPage = newPage;
        history.pushState({}, "", `?page=${currentPage}`);
        loadTokens();
    }

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) changePage(currentPage - 1);
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) changePage(currentPage + 1);
    });

    loadTokens();
});
