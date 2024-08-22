// Core state variables
const state = {
    clansPerPage: 10,
    currentPage: 1,
    totalClans: 0,
    currentBattle: null,
    clickLock: false // Lock to prevent spam clicking
};

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
        showPreloader(); // Show preloader before fetching data
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
        hidePreloader(); // Hide preloader after fetching data
    }
};

// Fetch clans data for the current page
const fetchClansData = async (page = state.currentPage) => {
    try {
        showPreloader(); // Show preloader before fetching data
        const response = await fetch(`https://biggamesapi.io/api/clans?page=${page}&pageSize=${state.clansPerPage}&sort=Points&sortOrder=desc`);
        const data = await response.json();
        return data.status === "ok" ? data.data : [];
    } catch (error) {
        console.error('Error fetching clans data:', error);
        return [];
    } finally {
        hidePreloader(); // Hide preloader after fetching data
    }
};

// Redirect to the new page with the clan name as a URL parameter
const redirectToClanPage = (clanName) => {
    window.location.href = `clan.html?name=${encodeURIComponent(clanName)}`;
};

// Display clans on the page
const displayClans = async (clans) => {
    showPreloader(); // Show preloader before displaying clans
    const clanList = document.getElementById('clan-list');
    clanList.innerHTML = '';

    const clanElements = await Promise.all(clans.map(async (clan, index) => {
        const globalRank = (state.currentPage - 1) * state.clansPerPage + index + 1;
        const card = document.createElement('a');
        card.classList.add('card');
        card.href = `clan.html?name=${encodeURIComponent(clan.Name)}`;

        const points = abbreviatePoints(clan.Points);
        const diamonds = abbreviatePoints(clan.DepositedDiamonds);
        const members = `${clan.Members}/${clan.MemberCapacity}`;

        card.innerHTML = `
            <div class="left-side">
                <span class="placement">${globalRank}${getSuffix(globalRank)}</span>
                <div class="clan-details">
                    <span class="clan-name">${clan.Name.toUpperCase()}</span>
                </div>
            </div>
            <div class="right-side">
                <span class="points"><img src="../imgs/star.png" alt="Points Icon"> ${points}</span>
                <span class="diamonds"><img src="https://biggamesapi.io/image/14867116353" alt="Diamonds"> ${diamonds}</span>
                <span class="members"><img src="members_icon.png" alt="Members Icon"> ${members}</span>
            </div>
        `;
        return card;
    }));

    clanElements.forEach(card => clanList.appendChild(card));

    if (state.currentPage === 1 && clans.length > 0) {
        updateTopClan(clans[0]);
    }

    hidePreloader(); // Hide preloader after displaying clans
};

// Update the top clan display
const updateTopClan = async (topClan) => {
    try {
        showPreloader(); // Show preloader before updating top clan
        const topClanNameElement = document.getElementById('top-clan-name');
        const topClanIconElement = document.getElementById('top-clan-icon');

        topClanNameElement.textContent = `${topClan.Name.toUpperCase()} (${abbreviatePoints(topClan.Points)})`;

        const topClanResponse = await fetch(`https://biggamesapi.io/api/clan/${topClan.Name}`);
        const topClanData = await topClanResponse.json();

        if (topClanData.status === "ok") {
            const topClanIconID = topClanData.data.Icon.replace('rbxassetid://', '');
            const topClanIconURL = `https://biggamesapi.io/image/${topClanIconID}`;
            topClanIconElement.src = topClanIconURL;
        }
    } catch (error) {
        console.error('Error updating top clan:', error);
    } finally {
        hidePreloader(); // Hide preloader after updating top clan
    }
};

// Update pagination controls
const updatePagination = (totalClans) => {
    const pageSelect = document.getElementById('page-select');
    const totalPages = Math.ceil(totalClans / state.clansPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
    }

    document.getElementById('prev-button').disabled = state.currentPage === 1;
    document.getElementById('next-button').disabled = state.currentPage === totalPages;
};

// Handle page change
const changePage = (direction) => {
    const totalPages = Math.ceil(state.totalClans / state.clansPerPage);
    if ((direction === 1 && state.currentPage < totalPages) || (direction === -1 && state.currentPage > 1)) {
        state.currentPage += direction;
        loadClans(); // Load the clans for the new page
        updatePagination(state.totalClans); // Update the pagination UI
    }
};

// Select a specific page
const selectPage = (page) => {
    state.currentPage = parseInt(page, 10);
    loadClans(); // Load the clans for the selected page
    updatePagination(state.totalClans); // Update the pagination UI
};

// Load clans data and display it
const loadClans = async () => {
    const clans = await fetchClansData(state.currentPage);
    await displayClans(clans);
};

// Show the preloader
function showPreloader() {
    document.getElementById('preloader').classList.remove('hidden');
}

// Hide the preloader and show content
function hidePreloader() {
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('content').style.display = 'block'; // Ensure content is visible
}

// Initialize the application
const init = async () => {
    try {
        showPreloader(); // Show preloader during initialization
        await fetchTotalClans();
        await loadClans();
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hidePreloader(); // Ensure preloader is hidden and content is shown
    }
};

// Start the app
init();