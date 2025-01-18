let data = [];
let filteredData = [];
let currentSortField = '';
let currentSortOrder = 'asc'; // Start with ascending order

// Fetch the data from the external JSON file
fetch('data.json')

    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        populateMitigationStrategies();  // Populate checkboxes
        filterData();  // Display initial data on load
    })
    .catch(error => console.error('Error fetching JSON:', error));

// Populate the Mitigation Strategy checkboxes
function populateMitigationStrategies() {
    const uniqueStrategies = [...new Set(data.map(item => item.MitigationStrategy))];
    const strategyContainer = document.getElementById('strategyCheckboxes');
    uniqueStrategies.forEach(strategy => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${strategy}" /> ${strategy}`;
        strategyContainer.appendChild(label);
    });

    // Add event listeners to all checkboxes for dynamic filtering
    document.querySelectorAll('.filters-row input').forEach(checkbox => {
        checkbox.addEventListener('input', filterData);
    });
}

// Filter data based on checkboxes (using OR logic for ML levels)
function filterData() {
    const ml1Checked = document.getElementById('ml1').checked;
    const ml2Checked = document.getElementById('ml2').checked;
    const ml3Checked = document.getElementById('ml3').checked;

    // Get selected mitigation strategies
    const selectedStrategies = Array.from(document.querySelectorAll('#strategyCheckboxes input:checked'))
                                    .map(checkbox => checkbox.value);

    filteredData = data.filter(item => {
        const matchesStrategy = selectedStrategies.length === 0 || selectedStrategies.includes(item.MitigationStrategy);
        
        // OR logic: Show rows if ANY ML checkbox is selected and matches TRUE
        const matchesML = (!ml1Checked && !ml2Checked && !ml3Checked) || 
                          (ml1Checked && item.ML1 === "TRUE") || 
                          (ml2Checked && item.ML2 === "TRUE") || 
                          (ml3Checked && item.ML3 === "TRUE");

        return matchesStrategy && matchesML;
    });

    displayData(filteredData);  // Update the table after filtering
}

// Display filtered data
function displayData(filteredData) {
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    filteredData.forEach(item => {
        const mitigationStrategy = item.MitigationStrategy || 'N/A';
        // Create main row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mitigationStrategy}</td>
            <td>${item.ControlReference || 'N/A'}</td>
            <td class="control-column">${item.Control || 'N/A'}</td>
            <td>${item.ML1 || ''}</td>
            <td>${item.ML2 || ''}</td>
            <td>${item.ML3 || ''}</td>
        `;
        
        // Create methodology row (hidden by default)
        const methodologyRow = document.createElement('tr');
        methodologyRow.className = 'methodology-row hidden';
        methodologyRow.innerHTML = `
            <td colspan="6">
                <div class="methodology-content">
                    <strong>Test Methodology:</strong>
                    <p>${formatText(item.TestMethodology || 'No test methodology available.')}</p>
                </div>
            </td>
        `;
        
        // Add click handler to the control cell
        const controlCell = row.querySelector('.control-column');
        controlCell.addEventListener('click', function() {
            methodologyRow.classList.toggle('hidden');
            row.classList.toggle('active');
        });
        
        tbody.appendChild(row);
        tbody.appendChild(methodologyRow);
    });
}

// Option 1: Replace \n with <br> tags
function formatText(text) {
    return text.replace(/\n/g, '<br>');
}

// Add this new function to handle showing the methodology
function showMethodology(methodology) {
    // Remove any existing methodology popup
    const existingPopup = document.getElementById('methodologyPopup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create and show the popup
    const popup = document.createElement('div');
    popup.id = 'methodologyPopup';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>Test Methodology</h3>
            <p>${formatText(methodology)}</p>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
}

// Sort table by a given field (MitigationStrategy or ControlReference)
function sortTable(field) {
    // Toggle sorting order if the same field is clicked again
    if (currentSortField === field) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortOrder = 'asc'; // Start with ascending order for new field
    }

    // Sort the filtered data (not the original dataset)
    filteredData.sort((a, b) => {
        const aValue = a[field] || '';
        const bValue = b[field] || '';
        
        if (aValue < bValue) return currentSortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    displayData(filteredData); // Re-render table after sorting
}

// Toggle between light mode and dark mode
const toggleButton = document.getElementById('toggleDarkMode');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        toggleButton.textContent = 'Toggle Dark Mode';
    } else {
        toggleButton.textContent = 'Toggle Light Mode';
    }
});

// Reset all checkboxes
const resetButton = document.getElementById('resetFilters');
resetButton.addEventListener('click', () => {
    document.querySelectorAll('.filters-row input').forEach(checkbox => {
        checkbox.checked = false;
    });
    filterData(); // Refresh the filtered data after reset
});
