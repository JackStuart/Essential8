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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mitigationStrategy}</td>
            <td>${item.ControlReference || 'N/A'}</td>
            <td>${item.Control || 'N/A'}</td>
            <td>${item.ML1 || ''}</td>
            <td>${item.ML2 || ''}</td>
            <td>${item.ML3 || ''}</td>
        `;
        tbody.appendChild(row);
    });
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

// Toggle dark mode
const toggleButton = document.getElementById('toggleDarkMode');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
