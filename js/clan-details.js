const state = {
    currentBattle: null,
    usernameCache: JSON.parse(localStorage.getItem('usernameCache')) || {},
    clickLock: false // Lock to prevent spam clicking
};

// Function to extract the clan name from the URL
const getClanNameFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('name');
};

const getSuffix = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = num % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
};

const fetchClanData = async () => {
    const clanName = getClanNameFromURL(); // Get clan name from URL

    if (!clanName) {
        document.getElementById('selected-clan-name').textContent = 'No clan specified.';
        return;
    }

    try {
        showPreloader(); // Show loading spinner

        // Fetch clan data from the API
        const response = await fetch(`https://biggamesapi.io/api/clan/${clanName}`);
        const data = await response.json();

        if (data.status === "ok") {
            displayClanData(data.data); // Display fetched data
        } else {
            console.error('Failed to fetch clan data');
            document.getElementById('selected-clan-name').textContent = 'Failed to load clan data.';
        }
    } catch (error) {
        console.error('Error fetching clan data:', error);
        document.getElementById('selected-clan-name').textContent = 'Error loading clan data.';
    } finally {
        hidePreloader(); // Hide loading spinner
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
        const responseData = await response.json();  // Parse response data
        const username = responseData.name;  // Use the parsed data correctly

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

// Function to display the fetched clan data
const displayClanData = async (clanData) => {
    const clanWar = clanData.Battles[state.currentBattle];
    const playerList = document.getElementById('player-list');

    showPreloader(); // Show preloader before displaying detailed clan data

    const iconID = clanData.Icon.replace('rbxassetid://', '');
    const iconURL = `https://biggamesapi.io/image/${iconID}`;
    const totalPoints = abbreviatePoints(clanWar.Points);
    const clanStatus = clanData.Status || 'Unknown';
    const clanDiamonds = abbreviatePoints(clanData.DepositedDiamonds || 0);

    // Set the clan name, icon, status, points, and diamonds
    document.getElementById('selected-clan-name').textContent = clanData.Name.toUpperCase();
    
    const clanIconElement = document.getElementById('clan-icon');
    clanIconElement.src = iconURL;
    clanIconElement.classList.remove('hidden');

    document.getElementById('clan-status').innerHTML = `${clanStatus}`;
    document.getElementById('total-points').innerHTML = `
        <img src="../imgs/star.png" alt="Star">
        ${totalPoints}
    `;

    document.getElementById('clan-diamonds').innerHTML = `<img src="https://biggamesapi.io/image/14867116353" alt="Diamonds"> ${clanDiamonds}`;
    document.getElementById('clan-details').classList.remove('hidden');

    playerList.innerHTML = '';

    // Sort and loop through both points and diamond contributions
    const diamondContributions = clanData.DiamondContributions.AllTime.Data || [];
    const contributions = clanData.Battles[state.currentBattle]?.PointContributions || [];

    contributions.sort((a, b) => b.Points - a.Points);

    for (const [index, contribution] of contributions.entries()) {
        const card = document.createElement('div');
        card.classList.add('card');

        const username = await fetchUsername(contribution.UserID);
        const points = abbreviatePoints(contribution.Points);

        // Find the corresponding diamond contribution
        const diamondContribution = diamondContributions.find(d => d.UserID === contribution.UserID);
        const diamonds = diamondContribution ? abbreviatePoints(diamondContribution.Diamonds) : '0';

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
        playerList.appendChild(card);
    }

    hidePreloader(); // Hide preloader after displaying detailed clan data
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

// Utility function to abbreviate points
const abbreviatePoints = (points) => {
    if (points == null || isNaN(points)) {
        return '0'; // Return a default value like '0' if points are not valid
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

document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html'; // Change the URL as per your structure
});


// Initialize the page
const init = async () => {
    try {
        showPreloader(); // Show preloader during initialization
        state.currentBattle = await fetchBattleDetails();
        await fetchClanData(); // Load the clan data
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hidePreloader(); // Ensure preloader is hidden and content is shown
    }
};

// Run the initialization
init();