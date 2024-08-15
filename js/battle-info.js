async function fetchBattleDetails() {
    try {
        const response = await fetch('https://biggamesapi.io/api/activeClanBattle');
        const data = await response.json();

        if (data.status === "ok") {
            const battleDetails = data.data;
            document.querySelector('.battle-name').textContent = battleDetails.configData.Title;
            startCountdown(battleDetails.configData.FinishTime);
            return battleDetails.configData._id;
        } else {
            console.error('Failed to fetch battle details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching battle details:', error);
        return null;
    }
}

function startCountdown(finishTime) {
    if (isNaN(finishTime) || finishTime <= 0) {
        console.error('Invalid finishTime:', finishTime);
        document.getElementById('countdown-timer').textContent = 'Invalid Time';
        return;
    }

    function updateCountdown() {
        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = finishTime - now;

        if (secondsLeft <= 0) {
            document.getElementById('countdown-timer').textContent = 'Time Left: 0s';
            clearInterval(intervalId);
            return;
        }

        const minutes = Math.floor(secondsLeft / 60) % 60;
        const hours = Math.floor(secondsLeft / 3600) % 24;
        const days = Math.floor(secondsLeft / 86400);

        document.getElementById('countdown-timer').textContent = `Time Left: ${days}d ${hours}h ${minutes}m ${secondsLeft % 60}s`;
    }

    const intervalId = setInterval(updateCountdown, 1000);
    updateCountdown(); // Run immediately to avoid 1-second delay
}


document.addEventListener('DOMContentLoaded', function() {
    fetchBattleDetails();
    startCountdown();
});