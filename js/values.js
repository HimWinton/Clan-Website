let currentKeyword = ''; // Track the current sorting keyword
const storageKey = 'petData';
const fetchInterval = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const petsPerPage = 105; // Number of pets to display per page
let currentPage = 1; // Track the current page
let currentVariant = ''; // Track the current variant
let shinyMode = false; // Track whether Shiny mode is active

// Event listeners for buttons
document.getElementById('huge-button').addEventListener('click', () => {
    showPreloader();
    document.getElementById('search-input').value = '';
    currentKeyword = 'Huge';
    currentPage = 1;
    displayPetsFromStorage();
});

document.getElementById('titanic-button').addEventListener('click', () => {
    showPreloader();
    document.getElementById('search-input').value = '';
    currentKeyword = 'Titanic';
    currentPage = 1;
    displayPetsFromStorage();
});

document.getElementById('reset-button').addEventListener('click', () => {
    showPreloader();
    currentKeyword = ''; // Clear keyword
    document.getElementById('search-input').value = ''; // Clear search input
    currentPage = 1;
    currentVariant = '';
    shinyMode = false;
    displayPetsFromStorage(); // Display all pets
});

document.getElementById('normal-button').addEventListener('click', () => {
    showPreloader();
    currentVariant = '';
    shinyMode = false;
    displayPetsFromStorage();
});

document.getElementById('golden-button').addEventListener('click', () => {
    showPreloader();
    currentVariant = 'Golden';
    shinyMode = false;
    displayPetsFromStorage();
});

document.getElementById('rainbow-button').addEventListener('click', () => {
    showPreloader();
    currentVariant = 'Rainbow';
    shinyMode = false;
    displayPetsFromStorage();
});

document.getElementById('shiny-button').addEventListener('click', () => {
    showPreloader();
    shinyMode = !shinyMode; // Toggle shiny mode
    displayPetsFromStorage();
});

async function fetchAndStorePets() {
    try {
        showPreloader();
        const response = await fetch('https://biggamesapi.io/api/collection/Pets');
        if (!response.ok) {
            throw new Error('Failed to fetch pet data from the API');
        }

        const petData = await response.json();

        if (Array.isArray(petData.data)) {
            const filteredPets = petData.data.filter(pet => {
                const nameLower = pet.configName.toLowerCase();
                return (
                    nameLower.includes('huge') ||
                    nameLower.includes('titanic') ||
                    pet.configData.exclusiveLevel !== undefined
                );
            });

            localStorage.setItem(storageKey, JSON.stringify({
                timestamp: Date.now(),
                data: filteredPets
            }));
            
            displayPetsFromStorage();
        } else {
            console.error('Fetched data is not an array:', petData.data);
        }
    } catch (error) {
        console.error('Error while fetching and storing pet data:', error);
    } finally {
        hidePreloader();
        updateNextFetchTimer(); // Update the timer when data is fetched
    }
}

async function displayPetsFromStorage() {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) {
        fetchAndStorePets();
        return;
    }

    const { timestamp, data } = JSON.parse(storedData);

    // Check if the data is older than 30 minutes
    if (Date.now() - timestamp > fetchInterval) {
        fetchAndStorePets();
        return;
    }

    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const petContainer = document.getElementById('pet-container');
    petContainer.innerHTML = ''; // Clear any existing content

    const filteredPets = data
        .filter(pet => {
            const petName = pet.configName.toLowerCase();
            return (currentKeyword && petName.includes(currentKeyword.toLowerCase())) ||
                (!currentKeyword && searchInput && petName.includes(searchInput)) ||
                (!currentKeyword && !searchInput);
        })
        .sort((a, b) => a.configName.localeCompare(b.configName)); // Sort alphabetically

    const start = (currentPage - 1) * petsPerPage;
    const paginatedPets = filteredPets.slice(start, start + petsPerPage);

    for (const pet of paginatedPets) {
        let isShiny = shinyMode;
        let variant = currentVariant;
        let pt = null;

        // Determine the variant based on the current variant
        if (currentVariant === 'Golden') {
            pt = 1;
        } else if (currentVariant === 'Rainbow') {
            pt = 2;
        }

        const rapValue = await fetchRAP(pet.configData.name, pt, isShiny);
        const existsValue = await fetchExists(pet.configData.name, pt, isShiny);
        await displayPet(pet, isShiny, variant, rapValue, existsValue);
    }

    updatePaginationControls(filteredPets.length);
    hidePreloader();
}

function updatePaginationControls(totalPets) {
    const totalPages = Math.ceil(totalPets / petsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination controls

    const createButton = (text, pageNumber, isDisabled = false, isActive = false, isDots = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        if (isDots) {
            button.classList.add('dots');
        } else {
            button.classList.add('page-button');
            button.disabled = isDisabled;
            if (isActive) button.classList.add('active');
            button.addEventListener('click', () => {
                showPreloader();
                currentPage = pageNumber;
                displayPetsFromStorage();
            });
        }
        return button;
    };

    // Create Previous button
    paginationContainer.appendChild(createButton('←', currentPage - 1, currentPage === 1, false));

    // Create First page button if not in the first few pages
    if (currentPage > 2) {
        paginationContainer.appendChild(createButton('1', 1));
        if (currentPage > 3) {
            paginationContainer.appendChild(createButton('...', null, true, false, true));
        }
    }

    // Create buttons for the current, previous, and next pages
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
        paginationContainer.appendChild(createButton(i, i, false, i === currentPage));
    }

    // Create Last page button if not in the last few pages
    if (currentPage < totalPages - 1) {
        if (currentPage < totalPages - 2) {
            paginationContainer.appendChild(createButton('...', null, true, false, true));
        }
        paginationContainer.appendChild(createButton(totalPages, totalPages));
    }

    // Create Next button
    paginationContainer.appendChild(createButton('→', currentPage + 1, currentPage === totalPages, false));
}

function abbreviateNumber(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'N/A'; // Return a default value like 'N/A' if the value is not a valid number
    }

    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;

    while (value >= 1000 && unitIndex < units.length - 1) {
        value /= 1000;
        unitIndex++;
    }

    // Convert to string with up to 2 decimal places without rounding
    let abbreviated = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];

    // Check if it's a whole number
    if (abbreviated.includes('.') && abbreviated.endsWith('00')) {
        abbreviated = parseFloat(abbreviated).toFixed(0);
    } else if (abbreviated.includes('.') && abbreviated.endsWith('0')) {
        abbreviated = parseFloat(abbreviated).toFixed(1);
    }

    return `${abbreviated}${units[unitIndex]}`;
}


async function fetchRAP(configName, pt, isShiny) {
    try {
        const response = await fetch('https://biggamesapi.io/api/rap');
        if (!response.ok) {
            throw new Error('Failed to fetch RAP data from the API');
        }

        const rapData = await response.json();

        // Find the RAP entry for the specific variant and shiny status
        const rapEntry = rapData.data.find(entry =>
            entry.configData.id === configName &&
            ((pt === null && !('pt' in entry.configData)) || entry.configData.pt === pt) && // Match pt only if it's provided
            ((!isShiny && !('sh' in entry.configData)) || (isShiny && entry.configData.sh === true)) // Match sh only if isShiny is true
        );

        return rapEntry ? rapEntry.value : null;
    } catch (error) {
        console.error(`Error fetching RAP data for ${configName} (pt: ${pt}, shiny: ${isShiny}):`, error);
        return null;
    }
}

async function fetchExists(configName, pt, isShiny) {
    try {
        const response = await fetch('https://biggamesapi.io/api/exists');
        if (!response.ok) {
            throw new Error('Failed to fetch Exists data from the API');
        }

        const existsData = await response.json();

        // Find the Exists entry for the specific variant and shiny status
        const existsEntry = existsData.data.find(entry =>
            entry.configData.id === configName &&
            ((pt === null && !('pt' in entry.configData)) || entry.configData.pt === pt) && // Match pt only if it's provided
            ((!isShiny && !('sh' in entry.configData)) || (isShiny && entry.configData.sh === true)) // Match sh only if isShiny is true
        );

        return existsEntry ? existsEntry.value : 'Unknown';
    } catch (error) {
        console.error(`Error fetching Exists data for ${configName} (pt: ${pt}, shiny: ${isShiny}):`, error);
        return 'Unknown';
    }
}

async function displayPet(pet, isShiny, variant, rapValue, existsValue) {
    const petName = pet.configName;

    // Attempt to use goldenThumbnail if the variant is Golden, fallback to the default thumbnail
    let thumbnail = pet.configData.thumbnail; // Default to the normal thumbnail
    if (variant === 'Golden' && pet.configData.goldenThumbnail) {
        try {
            const response = await fetch(`https://biggamesapi.io/image/${pet.configData.goldenThumbnail.replace('rbxassetid://', '')}`);
            if (response.ok) {
                thumbnail = pet.configData.goldenThumbnail;
            } else {
                console.warn(`Golden thumbnail not found for ${petName}, using default thumbnail.`);
            }
        } catch (error) {
            console.error(`Error fetching golden thumbnail for ${petName}:`, error);
        }
    }

    const assetId = thumbnail.replace('rbxassetid://', '');
    const imageUrl = `https://biggamesapi.io/image/${assetId}`;

    const rapImageUrl = 'https://biggamesapi.io/image/14867116353';
    const abbreviatedRap = rapValue !== null && rapValue !== undefined 
        ? abbreviateNumber(rapValue) 
        : 'No RAP';
    const existsDisplayValue = abbreviateNumber(existsValue);

    const petTile = document.createElement('div');
    petTile.classList.add('pet-tile');

    let displayName = `${variant} ${petName}`;
    if (isShiny) {
        displayName = `Shiny ${displayName}`;
    }

    const shinyIndicator = isShiny ? `<div class="shiny-indicator">✨ Shiny</div>` : '';

    petTile.innerHTML = `
        ${shinyIndicator}
        <img src="${imageUrl}" alt="${displayName}" class="pet-image">
        <h3 class="pet-name">${displayName}</h3>
        <div class="rap-container">
            <img src="${rapImageUrl}" alt="RAP" class="rap-image">
            <span class="rap-value">${abbreviatedRap}</span>
        </div>
        <div class="exists-container">
            <span class="exists-label">Exists: </span><span class="exists-value">${existsDisplayValue}</span>
        </div>
    `;

    document.getElementById('pet-container').appendChild(petTile);
}

function showPreloader() {
    document.getElementById('preloader').classList.remove('hidden');
}

function hidePreloader() {
    document.getElementById('preloader').classList.add('hidden');
}

document.getElementById('search-input').addEventListener('input', () => {
    showPreloader();
    currentKeyword = ''; // Clear the current keyword when searching
    currentPage = 1; // Reset to first page when searching
    displayPetsFromStorage();
});

document.addEventListener('DOMContentLoaded', () => displayPetsFromStorage()); // Fetch and display pets on page load



function resetLocalStorage() {
    localStorage.removeItem(storageKey);
    console.log('Local storage has been reset.');
    // Optionally, you can fetch fresh data after resetting
    fetchAndStorePets();
}

//document.getElementById('reset-storage-button').addEventListener('click', () => {
//    showPreloader();
//    resetLocalStorage();
//});

function updateNextFetchTimer() {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
        const { timestamp } = JSON.parse(storedData);
        const nextFetchTime = new Date(timestamp + fetchInterval);
        const now = new Date();

        const timeDifference = nextFetchTime - now;

        if (timeDifference > 0) {
            const hours = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            document.getElementById('next-fetch-timer').textContent = `Data refresh in ${hours}h ${minutes}m ${seconds}s`;
        } else {
            document.getElementById('next-fetch-timer').textContent = "Fetching new data...";
        }
    } else {
        document.getElementById('next-fetch-timer').textContent = "Fetching new data...";
    }
}

// Call the updateNextFetchTimer function every second to update the timer
setInterval(updateNextFetchTimer, 1000);
showPreloader();

