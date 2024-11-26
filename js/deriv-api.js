const app_id = 1089; // Replace with your app_id from Deriv
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + app_id);

ws.onopen = function() {
    console.log('Connected to Deriv WebSocket API');
    // Request active symbols once connected
    ws.send(JSON.stringify({
        "active_symbols": "brief",
        "product_type": "basic"
    }));
};

function requestContractsForSymbol(symbol) {
    ws.send(JSON.stringify({
        "contracts_for": symbol
    }));
}

ws.onmessage = function(msg) {
    const response = JSON.parse(msg.data);
    
    if (response.active_symbols) {
        const symbols = response.active_symbols;
        const dropdown = document.querySelector('.dropdown-labelled-outline');
        
        // Clear existing options
        dropdown.innerHTML = '<option value="">Select a symbol</option>';
        
        // Sort symbols by display name
        symbols.sort((a, b) => a.display_name.localeCompare(b.display_name));
        
        // Add symbols to dropdown
        symbols.forEach((symbol, index) => {
            const option = document.createElement('option');
            option.value = symbol.symbol;
            option.textContent = `${symbol.display_name} (${symbol.symbol})`;
            // Select the first symbol
            if (index === 0) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });

        // Request contracts for the first symbol
        requestContractsForSymbol(symbols[0].symbol);

        // Add change event listener to the first dropdown
        dropdown.addEventListener('change', (event) => {
            requestContractsForSymbol(event.target.value);
        });

        // Dispatch a change event to notify any listeners
        const event = new Event('change');
        dropdown.dispatchEvent(event);
    }

    if (response.contracts_for) {
        const contractsDropdown = document.querySelector('.dropdown-labelled-outline1');
        contractsDropdown.innerHTML = ''; // Clear existing options
        
        const contracts = response.contracts_for.available;
        
        // Get unique categories
        const uniqueCategories = new Set();
        contracts.forEach(contract => {
            uniqueCategories.add(contract.contract_category_display);
        });

        // Convert to array and sort
        const categories = Array.from(uniqueCategories).sort();
        
        // Add categories to dropdown
        categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            if (index === 0) {
                option.selected = true;
            }
            contractsDropdown.appendChild(option);
        });

        // Dispatch change event for the second dropdown
        const event = new Event('change');
        contractsDropdown.dispatchEvent(event);
    }
};

ws.onclose = function() {
    console.log('Disconnected from Deriv WebSocket API');
};

ws.onerror = function(error) {
    console.error('WebSocket Error:', error);
};
