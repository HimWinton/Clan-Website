const clansPerPage = 10;
let currentPage = 1;
let totalClans = 0;
let currentBattle = null;
const usernameCache = JSON.parse(localStorage.getItem('usernameCache')) || {};

const getSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    return j === 1 && k !== 11 ? 'st' :
           j === 2 && k !== 12 ? 'nd' :
           j === 3 && k !== 13 ? 'rd' : 'th';
};

const abbreviatePoints = async (points) => {
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

const fetchTotalClans = async () => {
    try {
        const response = await fetch('https://biggamesapi.io/api/clansTotal');
        const data = await response.json();
        if (data.status === "ok") {
            totalClans = data.totalCount || data.data || data.total || 0;
            updatePagination(totalClans); // Update pagination based on the total number of clans
        } else {
            console.error('Failed to fetch total clans');
        }
    } catch (error) {
        console.error('Error fetching total clans:', error);
    }
};


const fetchClansData = async (page = currentPage) => {
    try {
        const response = await fetch(`https://biggamesapi.io/api/clans?page=${page}&pageSize=${clansPerPage}&sort=Points&sortOrder=desc`);
        const data = await response.json();
        return data.status === "ok" ? data.data : [];
    } catch (error) {
        console.error('Error fetching clans data:', error);
        return [];
    }
};

const displayClans = async (clans) => {
    const clanList = document.getElementById('clan-list');
    clanList.innerHTML = '';

    const clanElements = await Promise.all(clans.map(async (clan, index) => {
        const globalRank = (currentPage - 1) * clansPerPage + index + 1;
        const card = document.createElement('div');
        card.classList.add('card');

        const points = await abbreviatePoints(clan.Points);

        card.innerHTML = `
            <span class="placement">${globalRank}${getSuffix(globalRank)}</span>
            <span class="user-id" onclick="fetchClanData('${clan.Name.toUpperCase()}')">${clan.Name.toUpperCase()}</span>
            <span class="points">${points}</span>
        `;
        return card;
    }));

    clanElements.forEach(card => clanList.appendChild(card));

    if (currentPage === 1 && clans.length > 0) {
        updateTopClan(clans[0]);
    }
};

const updateTopClan = async (topClan) => {
    try {
        const topClanNameElement = document.getElementById('top-clan-name');
        const topClanIconElement = document.getElementById('top-clan-icon');

        topClanNameElement.textContent = `${topClan.Name} (${await abbreviatePoints(topClan.Points)})`;

        const topClanResponse = await fetch(`https://biggamesapi.io/api/clan/${topClan.Name}`);
        const topClanData = await topClanResponse.json();

        if (topClanData.status === "ok") {
            const topClanIconID = topClanData.data.Icon.replace('rbxassetid://', '');
            const topClanIconURL = `https://biggamesapi.io/image/${topClanIconID}`;
            topClanIconElement.src = topClanIconURL;
        }
    } catch (error) {
        console.error('Error updating top clan:', error);
    }
};

const updatePagination = (totalClans) => {
    const pageSelect = document.getElementById('page-select');
    pageSelect.innerHTML = '';

    const totalPages = Math.ceil(totalClans / clansPerPage);
    
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        pageSelect.appendChild(option);
    }

    pageSelect.value = currentPage;
    document.getElementById('prev-button').disabled = currentPage === 1;
    document.getElementById('next-button').disabled = currentPage === totalPages;
};


const changePage = (direction) => {
    const totalPages = Math.ceil(totalClans / clansPerPage);
    if ((direction === 1 && currentPage < totalPages) || (direction === -1 && currentPage > 1)) {
        currentPage += direction;
        loadClans(); // Load the clans for the new page
        updatePagination(totalClans); // Update the pagination UI
    }
};

const selectPage = (page) => {
    currentPage = parseInt(page, 10);
    loadClans(); // Load the clans for the selected page
    updatePagination(totalClans); // Update the pagination UI
};


const fetchUsername = async (userId) => {
    if (usernameCache[userId]) {
        return usernameCache[userId];
    }

    try {
        const response = await fetch(`https://users.roproxy.com/v1/users/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch username for userId ${userId}`);
        }
        const data = await response.json();
        const username = data.name;

        usernameCache[userId] = username;
        localStorage.setItem('usernameCache', JSON.stringify(usernameCache));

        return username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return userId;
    }
};

const fetchClanData = async (clanName) => {
    try {
        const response = await fetch(`https://biggamesapi.io/api/clan/${clanName}`);
        const data = await response.json();
        if (data.status === "ok") {
            displayClanData(data.data);
        } else {
            console.error('Failed to fetch clan data');
        }
    } catch (error) {
        console.error('Error fetching clan data:', error);
    }
};

const displayClanData = async (clanData) => {
    const clanWar = clanData.Battles[currentBattle];
    const playerList = document.getElementById('player-list');

    if (!clanWar || !clanWar.PointContributions || clanWar.PointContributions.length === 0) {
        document.getElementById('total-points').textContent = '0';
        document.getElementById('global-rank').textContent = 'N/A';
        playerList.innerHTML = '<div>No contributions available.</div>';
        return;
    }

    const iconID = clanData.Icon.replace('rbxassetid://', '');
    const iconURL = `https://biggamesapi.io/image/${iconID}`;
    const totalPoints = await abbreviatePoints(clanWar.Points);

    document.getElementById('total-points').textContent = `Total Points: ${totalPoints}`;
    document.getElementById('selected-clan-name').textContent = clanData.Name;

    const clanIconElement = document.getElementById('clan-icon');
    clanIconElement.src = iconURL;
    clanIconElement.classList.remove('hidden');

    document.getElementById('total-points').classList.remove('hidden');

    playerList.innerHTML = '';

    clanWar.PointContributions.sort((a, b) => b.Points - a.Points);

    for (const [index, contribution] of clanWar.PointContributions.entries()) {
        const card = document.createElement('div');
        card.classList.add('card');

        const username = await fetchUsername(contribution.UserID);
        const points = await abbreviatePoints(contribution.Points);

        card.innerHTML = `
            <span class="placement">${index + 1}${getSuffix(index + 1)}</span>
            <span class="user-id">${username}</span>
            <span class="points">${points}</span>
        `;
        playerList.appendChild(card);
    }
};

const loadClans = async () => {
    const clans = await fetchClansData(currentPage);
    await displayClans(clans);
};

const init = async () => {
    try {
        document.getElementById('preloader').style.display = 'flex';
        document.getElementById('content').style.display = 'none';

        await fetchTotalClans();
        currentBattle = await fetchBattleDetails();
        await loadClans();

        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (error) {
        console.error('Error during initialization:', error);
        document.getElementById('preloader').innerHTML = '<p>Failed to load data. Please try again later.</p>';
    }
};

init();
