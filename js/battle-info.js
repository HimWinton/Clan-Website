// Cache DOM elements
const countdownTimer = document.getElementById('countdown-timer');
const battleNameElement = document.querySelector('.battle-name');

// Fetch battle details
async function fetchBattleDetails() {
    try {
        const response = await fetch('https://biggamesapi.io/api/activeClanBattle');
        const data = await response.json();

        if (data.status === "ok") {
            const { configData } = data.data;
            battleNameElement.textContent = configData.Title;
            startCountdown(configData.FinishTime);
            return configData._id;
        } else {
            console.error('Failed to fetch battle details');
            displayError('Failed to load battle details.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching battle details:', error);
        displayError('Error loading battle details.');
        return null;
    }
}

// Display error message in the UI
function displayError(message) {
    countdownTimer.textContent = message;
}

// Start the countdown timer
function startCountdown(finishTime) {
    if (!finishTime || isNaN(finishTime) || finishTime <= 0) {
        console.error('Invalid finishTime:', finishTime);
        displayError('Invalid Time');
        return;
    }

    const updateCountdown = () => {
        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = finishTime - now;

        if (secondsLeft <= 0) {
            countdownTimer.textContent = 'Time Left: 0s';
            clearInterval(intervalId);
            return;
        }

        const days = Math.floor(secondsLeft / 86400);
        const hours = Math.floor((secondsLeft % 86400) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;

        countdownTimer.textContent = 
            `Time Left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const intervalId = setInterval(updateCountdown, 1000);
    updateCountdown(); // Run immediately to avoid initial 1-second delay
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    fetchBattleDetails();
});