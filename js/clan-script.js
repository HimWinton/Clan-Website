const clansPerPage = 10;
let currentPage = 1;
let totalClans = 0;
let currentBattle = null;
const usernameCache = JSON.parse(localStorage.getItem('usernameCache')) || {};

function getSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
        return 'st';
    }
    if (j === 2 && k !== 12) {
        return 'nd';
    }
    if (j === 3 && k !== 13) {
        return 'rd';
    }
    return 'th';
}

async function abbreviatePoints(points) {
    const units = ['T', 'B', 'M', 'K'];
    const divisors = [1_000_000_000_000, 1_000_000_000, 1_000_000, 1_000];
    for (let i = 0; i < divisors.length; i++) {
        if (points >= divisors[i]) {
            const value = points / divisors[i];
            if (value % 1 === 0) {
                return `${value.toFixed(0)}${units[i]}`;
            }
            return `${value.toFixed(1).replace(/\.0$/, '')}${units[i]}`;
        }
    }
    return points.toFixed(0);
}

async function fetchTotalClans() {
    try {
        const response = await fetch('https://biggamesapi.io/api/clansTotal');
        const data = await response.json();
        if (data.status === "ok") {
            totalClans = data.totalCount || data.data || data.total || 0;
            updatePagination(totalClans);
        } else {
            console.error('Failed to fetch total clans');
        }
    } catch (error) {
        console.error('Error fetching total clans:', error);
    }
}

async function fetchClansData(page = currentPage) {
    try {
        const response = await fetch(`https://biggamesapi.io/api/clans?page=${page}&pageSize=${clansPerPage}&sort=Points&sortOrder=desc`);
        const data = await response.json();
        
        if (data.status === "ok") {
            return data.data;
        } else {
            console.error('Failed to fetch clans data');
            return [];
        }
    } catch (error) {
        console.error('Error fetching clans data:', error);
        return [];
    }
}

async function displayClans(clans) {
    const clanList = document.getElementById('clan-list');
    clanList.innerHTML = ''; 

    const clanElements = await Promise.all(clans.map(async (clan, index) => {
        const globalRank = (currentPage - 1) * clansPerPage + index + 1;
        const card = document.createElement('div');
        card.classList.add('card');

        const points = await abbreviatePoints(clan.Points); // Await the points abbreviation

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
}

async function updateTopClan(topClan) {
    try {
        document.getElementById('top-clan-name').textContent = `${topClan.Name} (${await abbreviatePoints(topClan.Points)})`;
        const topClanIconElement = document.getElementById('top-clan-icon');
        const topClanResponse = await fetch(`https://biggamesapi.io/api/clan/${topClan.Name}`);
        const topClanData = await topClanResponse.json();
        const topClanIconID = topClanData.data.Icon.replace('rbxassetid://', '');
        const topClanIconURL = `https://biggamesapi.io/image/${topClanIconID}`;
        topClanIconElement.src = topClanIconURL;
    } catch (error) {
        console.error('Error updating top clan:', error);
    }
}

function updatePagination(totalClans) {
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
}

function changePage(direction) {
    const totalPages = Math.ceil(totalClans / clansPerPage);
    if ((direction === 1 && currentPage < totalPages) || (direction === -1 && currentPage > 1)) {
        currentPage += direction;
        loadClans();
    }
}

function selectPage(page) {
    currentPage = parseInt(page);
    loadClans();
    updatePagination(totalClans);
}

async function fetchUsername(userId) {
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
        localStorage.setItem('usernameCache', JSON.stringify(usernameCache)); // Update localStorage

        return username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return userId;
    }
}

async function fetchClanData(clanName, globalRank) {
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
}

async function displayClanData(clanData) {
    const clanWar = clanData.Battles[currentBattle];
    if (!clanWar || !clanWar.PointContributions || clanWar.PointContributions.length === 0) {
        document.getElementById('total-points').textContent = '0';
        document.getElementById('global-rank').textContent = 'N/A';
        document.getElementById('player-list').innerHTML = '<div>No contributions available.</div>';
        return;
    }
    const iconID = clanData.Icon.replace('rbxassetid://', '');
    const iconURL = `https://biggamesapi.io/image/${iconID}`;
    const totalPoints = await abbreviatePoints(clanWar.Points); // Await the points abbreviation

    document.getElementById('total-points').textContent = 'Total Points: ' + totalPoints;
    document.getElementById('selected-clan-name').textContent = clanData.Name;

    const clanIconElement = document.getElementById('clan-icon');
    clanIconElement.src = iconURL;
    clanIconElement.classList.remove('hidden');

    document.getElementById('total-points').classList.remove('hidden');

    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';

    clanWar.PointContributions.sort((a, b) => b.Points - a.Points);

    for (const [index, contribution] of clanWar.PointContributions.entries()) {
        const card = document.createElement('div');
        card.classList.add('card');
        
        let username;
        try {
            username = await fetchUsername(contribution.UserID);
        } catch (error) {
            console.error('Error fetching username:', error);
            username = contribution.UserID; // Fallback to userId
        }

        const points = await abbreviatePoints(contribution.Points); // Await the points abbreviation
        
        card.innerHTML = `
            <span class="placement">${index + 1}${getSuffix(index + 1)}</span>
            <span class="user-id">${username}</span>
            <span class="points">${points}</span>
        `;
        playerList.appendChild(card);
    }
}

async function loadClans() {
    const clans = await fetchClansData();
    await displayClans(clans); // Ensure displayClans is awaited
}

async function init() {
    try {
        // Show preloader and hide content initially
        document.getElementById('preloader').style.display = 'flex';
        document.getElementById('content').style.display = 'none';

        await fetchTotalClans();
        currentBattle = await fetchBattleDetails(); 
        await loadClans();

        // Hide preloader and show content
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (error) {
        console.error('Error during initialization:', error);
        document.getElementById('preloader').innerHTML = '<p>Failed to load data. Please try again later.</p>';
    }
}

init();
