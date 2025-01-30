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

    async function fetchTokenDetails(address) {
        const apiUrl = `https://api.geckoterminal.com/api/v2/networks/bitrock/tokens/${address}`;
        try {
            const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
            const data = await response.json();
            return {
                fdv: data.data.attributes.fully_diluted_valuation_usd || "N/A",
                poolAddress: data.data.attributes.primary_pool_address || "N/A"
            };
        } catch (error) {
            console.error(`Error fetching details for token ${address}:`, error);
            return { fdv: "N/A", poolAddress: "N/A" };
        }
    }

    async function loadTokens() {
        tokenListElement.innerHTML = "<p>Loading...</p>";

        const startIdx = (currentPage - 1) * tokensPerPage;
        const paginatedTokens = tokens.slice(startIdx, startIdx + tokensPerPage);

        if (paginatedTokens.length === 0) {
            tokenListElement.innerHTML = "<p>No tokens available.</p>";
            return;
        }

        const tokenAddresses = paginatedTokens.map(token => token.address).join(",");
        const priceApiUrl = `https://api.geckoterminal.com/api/v2/simple/networks/bitrock/token_price/${tokenAddresses}?include_market_cap=true&include_24hr_vol=true`;

        try {
            const response = await fetch(priceApiUrl, { headers: { Accept: "application/json" } });
            const data = await response.json();
            const tokenPrices = data.data.attributes.token_prices;

            tokenListElement.innerHTML = "";

            for (const token of paginatedTokens) {
                const price = tokenPrices[token.address] || "N/A";
                const listItem = document.createElement("li");
                listItem.classList.add("token-item");

                listItem.innerHTML = `
                    <div class="token-header">
                        <img src="${token.image}" alt="Token Image">
                        <div class="token-info">
                            <strong>Address:</strong> ${token.address} <br>
                            <strong>Price:</strong> $${parseFloat(price).toFixed(6)}
                        </div>
                        <button class="toggle-details">+</button>
                    </div>
                    <div class="token-details" style="display: none;">
                        <p>Loading details...</p>
                    </div>
                `;

                const detailsDiv = listItem.querySelector(".token-details");
                const toggleButton = listItem.querySelector(".toggle-details");

                toggleButton.addEventListener("click", async () => {
                    if (detailsDiv.style.display === "none") {
                        detailsDiv.style.display = "block";
                        toggleButton.textContent = "−";

                        // Fetch additional details if not already loaded
                        if (!detailsDiv.dataset.loaded) {
                            const details = await fetchTokenDetails(token.address);
                            detailsDiv.innerHTML = `
                                <strong>FDV:</strong> $${details.fdv} <br>
                                <strong>Pool Address:</strong> ${details.poolAddress} <br>
                                <div class="links">
                                    <a href="${token.website}" target="_blank">Website</a>
                                    <a href="${token.telegram}" target="_blank">Telegram</a>
                                    <a href="${token.twitter}" target="_blank">Twitter</a>
                                </div>
                            `;
                            detailsDiv.dataset.loaded = "true";
                        }
                    } else {
                        detailsDiv.style.display = "none";
                        toggleButton.textContent = "+";
                    }
                });

                tokenListElement.appendChild(listItem);
            }
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
