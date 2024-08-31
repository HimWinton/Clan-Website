// Reward Strings
const rewards = {
    gold: "Huge Rainbow Rave Crab, Rave Crab Hoverboard, Rave Crab Booth, and Clan Gift",
    silver: "Huge Golden Rave Crab, Rave Crab Hoverboard, Rave Crab Booth, and Clan Gift",
    bronze: "Huge Rave Crab, Rave Crab Hoverboard, Rave Crab Booth, and Clan Gift",
    other: "Rave Crab Booth and Clan Gift",
    gift: "Clan Gift"
};

// Function to update reward elements
function updateRewards() {
    const goldRewardElement = document.getElementById('goldreward');
    const silverRewardElement = document.getElementById('silverreward');
    const bronzeRewardElement = document.getElementById('bronzereward');
    const otherRewardElement = document.getElementById('otherreward');
    const clanGiftElement = document.getElementById('clangift');

    // Check if elements exist before updating
    if (goldRewardElement) goldRewardElement.textContent = rewards.gold;
    if (silverRewardElement) silverRewardElement.textContent = rewards.silver;
    if (bronzeRewardElement) bronzeRewardElement.textContent = rewards.bronze;
    if (otherRewardElement) otherRewardElement.textContent = rewards.other;
    if (clanGiftElement) clanGiftElement.textContent = rewards.gift;
}

// Run the function on DOMContentLoaded
document.addEventListener('DOMContentLoaded', updateRewards);