let currentKeyword = '';
const storageKey = 'petData';
const fetchInterval = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const petsPerPage = 105;
let currentPage = 1;
let currentVariant = '';
let shinyMode = false;

// Cache DOM elements
const petContainer = document.getElementById('pet-container');
const preloader = document.getElementById('preloader');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');

// Event listeners for buttons
document.getElementById('huge-button').addEventListener('click', () => updateKeyword('Huge'));
document.getElementById('titanic-button').addEventListener('click', () => updateKeyword('Titanic'));
document.getElementById('reset-button').addEventListener('click', resetFilters);
document.getElementById('normal-button').addEventListener('click', () => updateVariant(''));
document.getElementById('golden-button').addEventListener('click', () => updateVariant('Golden'));
document.getElementById('rainbow-button').addEventListener('click', () => updateVariant('Rainbow'));
document.getElementById('shiny-button').addEventListener('click', toggleShinyMode);

searchInput.addEventListener('input', debounce(() => {
    currentKeyword = '';
    currentPage = 1;
    displayPetsFromStorage();
}, 300));

// Update the keyword filter and reset the page
function updateKeyword(keyword) {
    showPreloader();
    searchInput.value = '';
    currentKeyword = keyword;
    currentPage = 1;
    displayPetsFromStorage();
}

// Reset filters
function resetFilters() {
    showPreloader();
    currentKeyword = '';
    searchInput.value = '';
    currentPage = 1;
    currentVariant = '';
    shinyMode = false;
    displayPetsFromStorage();
}

// Update the variant filter and reset the page
function updateVariant(variant) {
    showPreloader();
    currentVariant = variant;
    shinyMode = false;
    displayPetsFromStorage();
}

// Toggle Shiny mode
function toggleShinyMode() {
    showPreloader();
    shinyMode = !shinyMode;
    displayPetsFromStorage();
}

// Fetch and store pets in local storage
async function fetchAndStorePets() {
    try {
        showPreloader();
        const response = await fetch('https://biggamesapi.io/api/collection/Pets');
        if (!response.ok) throw new Error('Failed to fetch pet data from the API');
        
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
        updateNextFetchTimer();
    }
}

// Display pets from local storage
async function displayPetsFromStorage() {
    const storedData = localStorage.getItem(storageKey);
    showPreloader();
    if (!storedData) {
        fetchAndStorePets();
        return;
    }

    const { timestamp, data } = JSON.parse(storedData);
    if (Date.now() - timestamp > fetchInterval) {
        fetchAndStorePets();
        return;
    }

    const searchValue = searchInput.value.toLowerCase();
    const filteredPets = data.filter(pet => filterPet(pet, searchValue))
        .sort((a, b) => a.configName.localeCompare(b.configName)); // Sort alphabetically

    const start = (currentPage - 1) * petsPerPage;
    const paginatedPets = filteredPets.slice(start, start + petsPerPage);

    const fragment = document.createDocumentFragment();
    for (const pet of paginatedPets) {
        const { rapValue, existsValue } = await fetchPetData(pet);
        fragment.appendChild(await createPetTile(pet, rapValue, existsValue));
    }
    petContainer.innerHTML = ''; // Clear any existing content
    petContainer.appendChild(fragment);

    updatePaginationControls(filteredPets.length);
    hidePreloader();
}

// Filter the pets based on current filters
function filterPet(pet, searchValue) {
    const petName = pet.configName.toLowerCase();
    return (
        (currentKeyword && petName.includes(currentKeyword.toLowerCase())) ||
        (!currentKeyword && searchValue && petName.includes(searchValue)) ||
        (!currentKeyword && !searchValue)
    );
}

// Fetch RAP and Exists data for the pet
async function fetchPetData(pet) {
    const pt = getVariantCode(currentVariant);
    const isShiny = shinyMode;

    const [rapValue, existsValue] = await Promise.all([
        fetchRAP(pet.configData.name, pt, isShiny),
        fetchExists(pet.configData.name, pt, isShiny)
    ]);

    return { rapValue, existsValue };
}

// Get variant code based on the current variant
function getVariantCode(variant) {
    switch (variant) {
        case 'Golden': return 1;
        case 'Rainbow': return 2;
        default: return null;
    }
}

// Create a pet tile
async function createPetTile(pet, rapValue, existsValue) {
    const petTile = document.createElement('div');
    petTile.classList.add('pet-tile');
    
    const { imageUrl, displayName } = getPetDisplayInfo(pet);
    const abbreviatedRap = abbreviateNumber(rapValue);
    const existsDisplayValue = abbreviateNumber(existsValue);

    petTile.innerHTML = `
        <div class="pet-image-wrapper">
            <img src="${imageUrl}" alt="${displayName}" class="pet-image">
        </div>
        <h3 class="pet-name">${displayName}</h3>
        <div class="rap-container">
            <img src="https://biggamesapi.io/image/14867116353" alt="RAP" class="rap-image">
            <span class="rap-value">${abbreviatedRap}</span>
        </div>
        <div class="exists-container">
            <span class="exists-label">Exists: </span><span class="exists-value">${existsDisplayValue}</span>
        </div>
    `;
    return petTile;
}

// Get pet display information
function getPetDisplayInfo(pet) {
    let thumbnail = pet.configData.thumbnail;
    if (currentVariant === 'Golden' && pet.configData.goldenThumbnail) {
        thumbnail = pet.configData.goldenThumbnail;
    }

    const assetId = thumbnail.replace('rbxassetid://', '');
    const imageUrl = `https://biggamesapi.io/image/${assetId}`;

    let displayName = `${currentVariant} ${pet.configName}`;
    if (shinyMode) {
        displayName = `Shiny ${displayName}`;
    }

    return { imageUrl, displayName };
}

// Abbreviate large numbers
function abbreviateNumber(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'N/A';
    }

    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;

    while (value >= 1000 && unitIndex < units.length - 1) {
        value /= 1000;
        unitIndex++;
    }

    let abbreviated = value.toFixed(2).replace(/\.?0+$/, "");
    return `${abbreviated}${units[unitIndex]}`;
}

// Debounce function to limit the rate at which a function can fire
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Pagination controls
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

// Fetch RAP data
async function fetchRAP(configName, pt, isShiny) {
    try {
        const response = await fetch('https://biggamesapi.io/api/rap');
        if (!response.ok) throw new Error('Failed to fetch RAP data');
        
        const rapData = await response.json();
        const rapEntry = rapData.data.find(entry =>
            entry.configData.id === configName &&
            ((pt === null && !('pt' in entry.configData)) || entry.configData.pt === pt) &&
            ((!isShiny && !('sh' in entry.configData)) || (isShiny && entry.configData.sh === true))
        );

        return rapEntry ? rapEntry.value : null;
    } catch (error) {
        console.error(`Error fetching RAP data for ${configName}:`, error);
        return null;
    }
}

// Fetch Exists data
async function fetchExists(configName, pt, isShiny) {
    try {
        const response = await fetch('https://biggamesapi.io/api/exists');
        if (!response.ok) throw new Error('Failed to fetch Exists data');
        
        const existsData = await response.json();
        const existsEntry = existsData.data.find(entry =>
            entry.configData.id === configName &&
            ((pt === null && !('pt' in entry.configData)) || entry.configData.pt === pt) &&
            ((!isShiny && !('sh' in entry.configData)) || (isShiny && entry.configData.sh === true))
        );

        return existsEntry ? existsEntry.value : 'Unknown';
    } catch (error) {
        console.error(`Error fetching Exists data for ${configName}:`, error);
        return 'Unknown';
    }
}

// Reset local storage
function resetLocalStorage() {
    localStorage.removeItem(storageKey);
    console.log('Local storage has been reset.');
    fetchAndStorePets();
}

// Update the next fetch timer
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

function showPreloader() {
    preloader.classList.remove('hidden');
}

function hidePreloader() {
    preloader.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', displayPetsFromStorage);

setInterval(updateNextFetchTimer, 1000);