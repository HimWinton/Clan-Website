// Reward Strings
const rewards = {
    gold: "Rainbow Huge Ice Cream Cone, Ice Cream Hoverboard, Ice Cream Booth, Clan Gift",
    silver: "Golden Huge Ice Cream Cone, Ice Cream Hoverboard, Ice Cream Booth, Clan Gift",
    bronze: "Huge Ice Cream Cone, Ice Cream Hoverboard, Ice Cream Booth, Clan Gift",
    other: "Ice Cream Booth, Clan Gift",
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