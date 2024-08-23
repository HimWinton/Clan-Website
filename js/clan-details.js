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

// Function to display the fetched clan data
const displayClanData = async (clanData) => {
    const clanWar = clanData.Battles[state.currentBattle];
    const iconURL = `https://biggamesapi.io/image/${clanData.Icon.replace('rbxassetid://', '')}`;
    const totalPoints = abbreviatePoints(clanWar.Points);
    const clanStatus = clanData.Status || 'Unknown';
    const clanDiamonds = abbreviatePoints(clanData.DepositedDiamonds || 0);

    selectedClanName.textContent = clanData.Name.toUpperCase();
    clanIconElement.src = iconURL;
    clanIconElement.classList.remove('hidden');
    clanStatusElement.innerHTML = clanStatus;
    totalPointsElement.innerHTML = `<img src="../imgs/star.png" alt="Star"> ${totalPoints}`;
    clanDiamondsElement.innerHTML = `<img src="https://biggamesapi.io/image/14867116353" alt="Diamonds"> ${clanDiamonds}`;
    document.getElementById('clan-details').classList.remove('hidden');

    playerList.innerHTML = '';
    const contributions = clanWar.PointContributions || [];
    contributions.sort((a, b) => b.Points - a.Points);

    const diamondContributions = clanData.DiamondContributions.AllTime.Data || [];
    const cards = await Promise.all(contributions.map(async (contribution, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        const username = await fetchUsername(contribution.UserID);
        const points = abbreviatePoints(contribution.Points);
        const diamonds = abbreviatePoints((diamondContributions.find(d => d.UserID === contribution.UserID) || {}).Diamonds || 0);

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
            window.location.href = '../clans/'; // Update this URL as needed
        });
        
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hidePreloader();
    }
};

// Run the initialization
init();