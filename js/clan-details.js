// Core state variables
const state = {
    currentBattle: null,
    usernameCache: JSON.parse(localStorage.getItem('usernameCache')) || {},
    clickLock: false // Lock to prevent spam clicking
};

// Cache DOM elements
const selectedClanName = document.getElementById('selected-clan-name');
const clanIconElement = document.getElementById('clan-icon');
const clanStatusElement = document.getElementById('clan-status');
const totalPointsElement = document.getElementById('total-points');
const clanDiamondsElement = document.getElementById('clan-diamonds');
const clanMembersElement = document.getElementById('clan-members');
const playerList = document.getElementById('player-list');
const preloader = document.getElementById('preloader');
const content = document.getElementById('content');
const backButton = document.getElementById('back-button');

// Utility functions
const getSuffix = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = num % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
};

const abbreviatePoints = (points) => {
    if (points == null || isNaN(points)) {
        return '0';
    }
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

// Function to extract the clan name from the URL
const getClanNameFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('name');
};

// Fetch clan data
const fetchClanData = async () => {
    const clanName = getClanNameFromURL();
    if (!clanName) {
        selectedClanName.textContent = 'No clan specified.';
        return;
    }

    try {
        showPreloader();
        const response = await fetch(`https://biggamesapi.io/api/clan/${clanName}`);
        const data = await response.json();

        if (data.status === "ok") {
            displayClanData(data.data);
        } else {
            throw new Error('Failed to fetch clan data');
        }
    } catch (error) {
        console.error('Error fetching clan data:', error);
        selectedClanName.textContent = 'Error loading clan data.';
    } finally {
        hidePreloader();
    }
};

// Fetch username with caching
const fetchUsername = async (userId) => {
    const cacheKey = `username_${userId}`;
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));

    if (cachedData && Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
        return cachedData.username;
    }

    try {
        const response = await fetch(`https://users.roproxy.com/v1/users/${userId}`);
        if (!response.ok) throw new Error(`Failed to fetch username for userId ${userId}`);
        const { name: username } = await response.json();

        localStorage.setItem(cacheKey, JSON.stringify({ username, timestamp: Date.now() }));
        return username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return userId;
    }
};

const displayClanData = async (clanData) => {
    const clanWar = clanData.Battles[state.currentBattle];
    const iconURL = `https://biggamesapi.io/image/${clanData.Icon.replace('rbxassetid://', '')}`;
    const totalPoints = abbreviatePoints(clanWar?.Points || 0);
    const clanStatus = clanData.Status || 'Unknown';
    const clanDiamonds = abbreviatePoints(clanData.DepositedDiamonds || 0);

    selectedClanName.textContent = clanData.Name.toUpperCase();
    clanIconElement.src = iconURL;
    clanIconElement.classList.remove('hidden');
    clanStatusElement.innerHTML = clanStatus;
    totalPointsElement.innerHTML = `<img src="../imgs/star.png" alt="Star"> ${totalPoints}`;
    clanDiamondsElement.innerHTML = `<img src="https://biggamesapi.io/image/14867116353" alt="Diamonds Icon"> ${clanDiamonds}`;
    clanMembersElement.innerHTML = `<img src="../imgs/members.png" alt="Members Icon"> ${clanData.Members.length}/${clanData.MemberCapacity}`;
    document.getElementById('clan-details').classList.remove('hidden');

    playerList.innerHTML = '';

    // Fetch diamond contributions
    const diamondContributions = clanData.DiamondContributions.AllTime.Data || [];

    // Map members to include their total points
    const membersWithPoints = clanData.Members.map(member => {
        const points = (clanWar?.PointContributions.find(c => c.UserID === member.UserID) || {}).Points || 0;
        const diamonds = (diamondContributions.find(d => d.UserID === member.UserID) || {}).Diamonds || 0;
        return {
            ...member,
            Points: points,
            Diamonds: diamonds,
            TotalPoints: points // You can add other factors here if necessary
        };
    });

    // Sort members by total points
    membersWithPoints.sort((a, b) => b.TotalPoints - a.TotalPoints);

    // Render each member card
    const cards = await Promise.all(membersWithPoints.map(async (member, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        const username = await fetchUsername(member.UserID);
        const points = abbreviatePoints(member.Points);
        const diamonds = abbreviatePoints(member.Diamonds);

        card.innerHTML = `
            <div class="left-side">
                <span class="placement">${index + 1}${getSuffix(index + 1)}</span>
                <div class="clan-details">
                    <span class="user-id">${username}</span>
                </div>
            </div>
            <div class="right-side">
                <span class="points"><img src="../imgs/star.png" alt="Points Icon"> ${points}</span>
                <span class="diamonds"><img src="https://biggamesapi.io/image/14867116353" alt="Diamonds Icon"> ${diamonds}</span>
            </div>
        `;
        return card;
    }));

    // Append all cards to the player list
    cards.forEach(card => playerList.appendChild(card));
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

// Initialize the page
const init = async () => {
    try {
        showPreloader();
        state.currentBattle = await fetchBattleDetails();
        await fetchClanData();

        backButton.addEventListener('click', () => {
            window.location.href = '../clans/';
        });

    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hidePreloader();
    }
};

// Run the initialization
init();