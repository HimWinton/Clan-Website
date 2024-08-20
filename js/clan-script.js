// Core state variables
const state = {
    clansPerPage: 10,
    currentPage: 1,
    totalClans: 0,
    currentBattle: null,
    usernameCache: JSON.parse(localStorage.getItem('usernameCache')) || {},
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

// Fetch and display detailed clan data based on the clan name
const fetchClanData = async (clanName) => {
    if (state.clickLock) {
        return; // Exit if there's an ongoing request
    }
    
    state.clickLock = true; // Set the lock to prevent further clicks

    try {
        showPreloader(); // Show preloader before fetching data
        const response = await fetch(`https://biggamesapi.io/api/clan/${clanName}`);
        const data = await response.json();
        if (data.status === "ok") {
            await displayClanData(data.data);
        } else {
            console.error('Failed to fetch clan data');
        }
    } catch (error) {
        console.error('Error fetching clan data:', error);
    } finally {
        // Release the lock after a short delay (e.g., 1 second)
        setTimeout(() => {
            state.clickLock = false;
            hidePreloader(); // Hide preloader after fetching data
        }, 1000); // Adjust delay as needed
    }
};

// Fetch username with caching
const fetchUsername = async (userId) => {
    const cachedData = JSON.parse(localStorage.getItem(`username_${userId}`));

    // Check if the cache exists and is not expired
    if (cachedData && Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
        return cachedData.username;
    }

    // Fetch from the API if not cached or expired
    try {
        showPreloader(); // Show preloader before fetching data
        const response = await fetch(`https://users.roproxy.com/v1/users/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch username for userId ${userId}`);
        }
        const data = await response.json();
        const username = data.name;

        // Cache the username with a timestamp
        localStorage.setItem(`username_${userId}`, JSON.stringify({
            username,
            timestamp: Date.now()
        }));

        return username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return userId;
    } finally {
        hidePreloader(); // Hide preloader after fetching data
    }
};

// Display clans on the page
const displayClans = async (clans) => {
    showPreloader(); // Show preloader before displaying clans
    const clanList = document.getElementById('clan-list');
    clanList.innerHTML = '';

    const clanElements = await Promise.all(clans.map(async (clan, index) => {
        const globalRank = (state.currentPage - 1) * state.clansPerPage + index + 1;
        const card = document.createElement('div');
        card.classList.add('card');

        const points = abbreviatePoints(clan.Points);

        card.innerHTML = `
            <span class="placement">${globalRank}${getSuffix(globalRank)}</span>
            <span class="user-id" onclick="fetchClanData('${clan.Name.toUpperCase()}')">${clan.Name.toUpperCase()}</span>
            <span class="points">${points}</span>
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

const displayClanData = async (clanData) => {
    const clanWar = clanData.Battles[state.currentBattle];
    const playerList = document.getElementById('player-list');

    showPreloader(); // Show preloader before displaying detailed clan data

    if (!clanWar || !clanWar.PointContributions || clanWar.PointContributions.length === 0) {
        document.getElementById('total-points').textContent = '0';
        document.getElementById('global-rank').textContent = 'N/A';
        playerList.innerHTML = '<div>No contributions available.</div>';
        hidePreloader(); // Hide preloader after displaying no data
        return;
    }

    const iconID = clanData.Icon.replace('rbxassetid://', '');
    const iconURL = `https://biggamesapi.io/image/${iconID}`;
    const totalPoints = abbreviatePoints(clanWar.Points);
    const clanStatus = clanData.Status || 'Unknown';  // Assuming status is available in clanData
    const clanDiamonds = abbreviatePoints(clanData.DepositedDiamonds || 0); // Assuming diamonds are available in clanData

    // Set the clan name at the top
    document.getElementById('selected-clan-name').textContent = clanData.Name.toUpperCase();

    // Set the clan icon and details
    const clanIconElement = document.getElementById('clan-icon');
    clanIconElement.src = iconURL;
    clanIconElement.classList.remove('hidden');

    // Set the clan status, points, and diamonds (using the image for diamonds)
    document.getElementById('clan-status').innerHTML = `${clanStatus}`;
    document.getElementById('total-points').innerHTML = `
        <img src="../imgs/star.png" alt="Star">
        ${totalPoints}
    `;
    document.getElementById('clan-diamonds').innerHTML = `
        <img src="https://biggamesapi.io/image/14867116353" alt="Diamonds">
        ${clanDiamonds}
    `;
    document.getElementById('clan-details').classList.remove('hidden');

    playerList.innerHTML = '';

    clanWar.PointContributions.sort((a, b) => b.Points - a.Points);

    for (const [index, contribution] of clanWar.PointContributions.entries()) {
        const card = document.createElement('div');
        card.classList.add('card');

        const username = await fetchUsername(contribution.UserID);
        const points = abbreviatePoints(contribution.Points);

        card.innerHTML = `
            <span class="placement">${index + 1}${getSuffix(index + 1)}</span>
            <span class="user-id">${username}</span>
            <span class="points">${points}</span>
        `;
        playerList.appendChild(card);
    }

    hidePreloader(); // Hide preloader after displaying detailed clan data
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
        state.currentBattle = await fetchBattleDetails(); // Ensure this function exists
        await loadClans();
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hidePreloader(); // Ensure preloader is hidden and content is shown
    }
};

// Start the app
init();