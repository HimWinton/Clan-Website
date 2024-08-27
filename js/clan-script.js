// Core state variables
const state = {
    clansPerPage: 10,
    currentPage: 1,
    totalClans: 0,
    allClans: [], // Store all clans for searching and filtering
    filteredClans: [], // Store filtered clans
};

// Cache DOM elements
const preloader = document.getElementById('preloader');
const clanList = document.getElementById('clan-list');
const content = document.getElementById('content');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const clanSearchInput = document.getElementById('clan-search');

// Utility functions
const getSuffix = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = num % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
};

const abbreviatePoints = (points) => {
    const units = ['T', 'B', 'M', 'K'];
    const divisors = [1_000_000_000_000, 1_000_000_000, 1_000_000, 1_000];

    for (let i = 0; i < divisors.length; i++) {
        if (points >= divisors[i]) {
            const value = points / divisors[i];
            return `${value.toFixed(value % 1 === 0 ? 0 : 1).replace(/\.0$/, '')}${units[i]}`;
        }
    }
    return points.toFixed(0);
};

// Fetch total number of clans
const fetchTotalClans = async () => {
    try {
        showPreloader();
        const response = await fetch('https://biggamesapi.io/api/clansTotal');
        const data = await response.json();
        if (data.status === "ok") {
            state.totalClans = data.totalCount || data.data || data.total || 0;
        } else {
            console.error('Failed to fetch total clans');
        }
    } catch (error) {
        console.error('Error fetching total clans:', error);
    } finally {
        hidePreloader();
    }
};

// Fetch all clans data by looping through all pages
const fetchAllClans = async () => {
    const allClans = [];
    const totalPages = Math.ceil(state.totalClans / state.clansPerPage);
    try {
        showPreloader();
        for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
            const response = await fetch(`https://biggamesapi.io/api/clans?page=${currentPage}&pageSize=${state.clansPerPage}&sort=Points&sortOrder=desc`);
            const data = await response.json();
            if (data.status === "ok") {
                allClans.push(...data.data);
            } else {
                console.error('Failed to fetch clans on page', currentPage);
            }
        }
    } catch (error) {
        console.error('Error fetching all clans:', error);
    } finally {
        hidePreloader();
    }
    return allClans;
};

// Load all clans and display the first page
const loadAllClans = async () => {
    await fetchTotalClans(); // Get the total number of clans
    state.allClans = await fetchAllClans(); // Fetch all clans
    state.filteredClans = state.allClans; // Initialize filteredClans with allClans
    state.currentPage = 1; // Start on the first page
    displayClans(getClansForCurrentPage()); // Display the first page of clans
    updatePagination(); // Update pagination buttons
};

// Filter clans based on search input
const filterClans = () => {
    const searchTerm = clanSearchInput.value.toLowerCase();
    state.filteredClans = state.allClans.filter(clan => clan.Name.toLowerCase().includes(searchTerm));
    state.currentPage = 1; // Reset to the first page of filtered results
    displayClans(getClansForCurrentPage()); // Display the first page of filtered clans
    updatePagination(); // Update pagination buttons
};

// Get clans for the current page
const getClansForCurrentPage = () => {
    const start = (state.currentPage - 1) * state.clansPerPage;
    const end = start + state.clansPerPage;
    return state.filteredClans.slice(start, end);
};

// Display clans on the page
const displayClans = (clans) => {
    clanList.innerHTML = ''; // Clear the existing list

    clans.forEach((clan, index) => {
        const globalRank = (state.currentPage - 1) * state.clansPerPage + index + 1;
        const card = document.createElement('a');
        card.classList.add('card');
        card.href = `clan.html?name=${encodeURIComponent(clan.Name)}`;

        const clanIconID = clan.Icon.replace('rbxassetid://', '');
        const clanIconURL = `https://biggamesapi.io/image/${clanIconID}`;

        const points = abbreviatePoints(clan.Points);
        const diamonds = abbreviatePoints(clan.DepositedDiamonds);
        const members = `${clan.Members}/${clan.MemberCapacity}`;

        card.innerHTML = `
            <img id="clan-icon" src="${clanIconURL}" alt="Clan Icon">
            <div class="left-side">
                <span class="placement">${globalRank}${getSuffix(globalRank)}</span>
                <div class="clan-details">
                    <span class="clan-name">${clan.Name.toUpperCase()}</span>
                </div>
            </div>
            <div class="right-side">
                <span class="points"><img src="../imgs/star.png" alt="Points Icon"> ${points}</span>
                <span class="diamonds"><img src="https://biggamesapi.io/image/14867116353" alt="Diamonds"> ${diamonds}</span>
                <span class="members"><img src="../imgs/members.png" alt="Members Icon"> ${members}</span>
            </div>
        `;
        clanList.appendChild(card);
    });
};

// Update pagination controls
const updatePagination = () => {
    const totalPages = Math.ceil(state.filteredClans.length / state.clansPerPage);
    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === totalPages;
};

// Handle page change
const changePage = (direction) => {
    const totalPages = Math.ceil(state.filteredClans.length / state.clansPerPage);
    if ((direction === 1 && state.currentPage < totalPages) || (direction === -1 && state.currentPage > 1)) {
        state.currentPage += direction;
        displayClans(getClansForCurrentPage());
        updatePagination();
    }
};

// Initialize the application
const init = async () => {
    try {
        showPreloader();
        await loadAllClans(); // Load and display all clans at the start
        clanSearchInput.addEventListener('input', filterClans); // Attach search event listener
        prevButton.addEventListener('click', () => changePage(-1)); // Handle previous page click
        nextButton.addEventListener('click', () => changePage(1)); // Handle next page click
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hidePreloader();
    }
};

// Show the preloader
function showPreloader() {
    preloader.classList.remove('hidden');
}

// Hide the preloader and show content
function hidePreloader() {
    preloader.classList.add('hidden');
    content.style.display = 'block';
}

// Start the app
init();