const masteryLevelXP = [
    { level: 1, expToNext: 83 },
    { level: 2, expToNext: 91 },
    { level: 3, expToNext: 102 },
    { level: 4, expToNext: 112 },
    { level: 5, expToNext: 124 },
    { level: 6, expToNext: 138 },
    { level: 7, expToNext: 151 },
    { level: 8, expToNext: 168 },
    { level: 9, expToNext: 185 },
    { level: 10, expToNext: 204 },
    { level: 11, expToNext: 226 },
    { level: 12, expToNext: 249 },
    { level: 13, expToNext: 274 },
    { level: 14, expToNext: 304 },
    { level: 15, expToNext: 335 },
    { level: 16, expToNext: 369 },
    { level: 17, expToNext: 408 },
    { level: 18, expToNext: 450 },
    { level: 19, expToNext: 497 },
    { level: 20, expToNext: 548 },
    { level: 21, expToNext: 606 },
    { level: 22, expToNext: 667 },
    { level: 23, expToNext: 737 },
    { level: 24, expToNext: 814 },
    { level: 25, expToNext: 898 },
    { level: 26, expToNext: 990 },
    { level: 27, expToNext: 1094 },
    { level: 28, expToNext: 1207 },
    { level: 29, expToNext: 1332 },
    { level: 30, expToNext: 1470 },
    { level: 31, expToNext: 1623 },
    { level: 32, expToNext: 1791 },
    { level: 33, expToNext: 1977 },
    { level: 34, expToNext: 2182 },
    { level: 35, expToNext: 2409 },
    { level: 36, expToNext: 2658 },
    { level: 37, expToNext: 2935 },
    { level: 38, expToNext: 3240 },
    { level: 39, expToNext: 3576 },
    { level: 40, expToNext: 3947 },
    { level: 41, expToNext: 4358 },
    { level: 42, expToNext: 4810 },
    { level: 43, expToNext: 5310 },
    { level: 44, expToNext: 5863 },
    { level: 45, expToNext: 6471 },
    { level: 46, expToNext: 7144 },
    { level: 47, expToNext: 7887 },
    { level: 48, expToNext: 8707 },
    { level: 49, expToNext: 9612 },
    { level: 50, expToNext: 10612 },
    { level: 51, expToNext: 11715 },
    { level: 52, expToNext: 12934 },
    { level: 53, expToNext: 14278 },
    { level: 54, expToNext: 15764 },
    { level: 55, expToNext: 17404 },
    { level: 56, expToNext: 19214 },
    { level: 57, expToNext: 21212 },
    { level: 58, expToNext: 23420 },
    { level: 59, expToNext: 25856 },
    { level: 60, expToNext: 28546 },
    { level: 61, expToNext: 31516 },
    { level: 62, expToNext: 34795 },
    { level: 63, expToNext: 38416 },
    { level: 64, expToNext: 42413 },
    { level: 65, expToNext: 46826 },
    { level: 66, expToNext: 51699 },
    { level: 67, expToNext: 57079 },
    { level: 68, expToNext: 63019 },
    { level: 69, expToNext: 69576 },
    { level: 70, expToNext: 76818 },
    { level: 71, expToNext: 84812 },
    { level: 72, expToNext: 93638 },
    { level: 73, expToNext: 103383 },
    { level: 74, expToNext: 114143 },
    { level: 75, expToNext: 126022 },
    { level: 76, expToNext: 139138 },
    { level: 77, expToNext: 153619 },
    { level: 78, expToNext: 169608 },
    { level: 79, expToNext: 187260 },
    { level: 80, expToNext: 206750 },
    { level: 81, expToNext: 228269 },
    { level: 82, expToNext: 252027 },
    { level: 83, expToNext: 278259 },
    { level: 84, expToNext: 307221 },
    { level: 85, expToNext: 339198 },
    { level: 86, expToNext: 374502 },
    { level: 87, expToNext: 413482 },
    { level: 88, expToNext: 456519 },
    { level: 89, expToNext: 504037 },
    { level: 90, expToNext: 556499 },
    { level: 91, expToNext: 614422 },
    { level: 92, expToNext: 678376 },
    { level: 93, expToNext: 748985 },
    { level: 94, expToNext: 826944 },
    { level: 95, expToNext: 913019 },
    { level: 96, expToNext: 1008052 },
    { level: 97, expToNext: 1112977 },
    { level: 98, expToNext: 1228825 },
    { level: 99, expToNext: 0 }
];

const masteryXPData = {
    Potions: [
        { xpPerAction: 10, actionName: "Tier II Potions", actionVerb: "Craft" },
        { xpPerAction: 25, actionName: "Tier III Potions", actionVerb: "Craft" },
        { xpPerAction: 45, actionName: "Tier IV Potions", actionVerb: "Craft" },
        { xpPerAction: 70, actionName: "Tier V Potions", actionVerb: "Craft" },
        { xpPerAction: 100, actionName: "Tier VI Potions", actionVerb: "Craft" },
        { xpPerAction: 140, actionName: "Tier VII Potions", actionVerb: "Craft" },
        { xpPerAction: 190, actionName: "Tier VIII Potions", actionVerb: "Craft" },
        { xpPerAction: 300, actionName: "Tier IX Potions", actionVerb: "Craft" },

        { xpPerAction: 2, actionName: "Tier I Potions", actionVerb: "Drink" },
        { xpPerAction: 3, actionName: "Tier II Potions", actionVerb: "Drink" },
        { xpPerAction: 6, actionName: "Tier III Potions", actionVerb: "Drink" },
        { xpPerAction: 11, actionName: "Tier IV Potions", actionVerb: "Drink" },
        { xpPerAction: 18, actionName: "Tier V Potions", actionVerb: "Drink" },
        { xpPerAction: 30, actionName: "Tier VI Potions", actionVerb: "Drink" },
        { xpPerAction: 65, actionName: "Tier VII Potions", actionVerb: "Drink" },
        { xpPerAction: 90, actionName: "Tier VIII Potions", actionVerb: "Drink" },
        { xpPerAction: 135, actionName: "Tier IX Potions", actionVerb: "Drink" },
        { xpPerAction: 180, actionName: "Tier X Potions", actionVerb: "Drink" },
        { xpPerAction: 2, actionName: "Cocktail Potions", actionVerb: "Drink" },
    ],
    Enchants: [
        { xpPerAction: 15, actionName: "Tier II Enchants", actionVerb: "Craft" },
        { xpPerAction: 35, actionName: "Tier III Enchants", actionVerb: "Craft" },
        { xpPerAction: 65, actionName: "Tier IV Enchants", actionVerb: "Craft" },
        { xpPerAction: 90, actionName: "Tier V Enchants", actionVerb: "Craft" },
        { xpPerAction: 120, actionName: "Tier VI Enchants", actionVerb: "Craft" },
        { xpPerAction: 160, actionName: "Tier VII Enchants", actionVerb: "Craft" },
        { xpPerAction: 210, actionName: "Tier VIII Enchants", actionVerb: "Craft" },
        { xpPerAction: 270, actionName: "Tier IX Enchants", actionVerb: "Craft" },
    ],
    Breakables: [
        { xpPerAction: 1 / 3, actionName: "Breakables", actionVerb: "Break" },
    ],
    Keys: [
        { xpPerAction: 10, actionName: "Crystal Keys", actionVerb: "Craft" },
        { xpPerAction: 15, actionName: "Tech Keys", actionVerb: "Craft" },
        { xpPerAction: 20, actionName: "Void Keys", actionVerb: "Craft" },
        { xpPerAction: 20, actionName: "Secret Keys", actionVerb: "Craft" },
        { xpPerAction: 30, actionName: "Treasure Keys", actionVerb: "Craft" },

        { xpPerAction: 100, actionName: "Crystal Keys", actionVerb: "Use" },
        { xpPerAction: 150, actionName: "Tech Keys", actionVerb: "Use" },
        { xpPerAction: 200, actionName: "Void Keys", actionVerb: "Use" },
        { xpPerAction: 400, actionName: "Secret Keys", actionVerb: "Use" },
        { xpPerAction: 1000, actionName: "Treasure Keys", actionVerb: "Use" },
    ],
    Fruit: [
        { xpPerAction: 20 / 5, actionName: "Basic Fruits", actionVerb: "Consume" },
        { xpPerAction: 50, actionName: "Rainbow Fruits", actionVerb: "Consume" },

        { xpPerAction: 30, actionName: "Rainbow Fruits", actionVerb: "Fuse" },
    ],
    Gifts: [
        { xpPerAction: 15, actionName: "Gift Bags", actionVerb: "Open" },
        { xpPerAction: 25, actionName: "Large Gift Bags", actionVerb: "Open" },
        { xpPerAction: 20, actionName: "Toy Bundles", actionVerb: "Open" },
        { xpPerAction: 20, actionName: "Potion Bundles", actionVerb: "Open" },
        { xpPerAction: 20, actionName: "Fruit Bundles", actionVerb: "Open" },
        { xpPerAction: 20, actionName: "Flag Bundles", actionVerb: "Open" },
        { xpPerAction: 20, actionName: "Enchant Bundles", actionVerb: "Open" },
        { xpPerAction: 35, actionName: "Large Enchant Bundles", actionVerb: "Open" },
        { xpPerAction: 70, actionName: "Large Potion Bundles", actionVerb: "Open" },
        { xpPerAction: 90, actionName: "Mini-Chests", actionVerb: "Open" },
        { xpPerAction: 135, actionName: "Rainbow Mini-Chests", actionVerb: "Open" },
        { xpPerAction: 65, actionName: "Charm Stones", actionVerb: "Open" },
        { xpPerAction: 15, actionName: "Seed Bags", actionVerb: "Open" },
    ],
    Digging: [
        { xpPerAction: 5, actionName: "Blocks on Layer 1 of Normal Digsite", actionVerb: "Break" },
        { xpPerAction: 7, actionName: "Blocks on Layer 2 of Normal Digsite", actionVerb: "Break" },
        { xpPerAction: 9, actionName: "Blocks on Layer 3 of Normal Digsite", actionVerb: "Break" },
        { xpPerAction: 13, actionName: "Blocks on Layer 4 of Normal Digsite", actionVerb: "Break" },
        { xpPerAction: 15, actionName: "Blocks on Layer 5 of Normal Digsite", actionVerb: "Break" },

        { xpPerAction: 10, actionName: "Blocks on Layer 1 in Advanced Digsite", actionVerb: "Break" },
        { xpPerAction: 15, actionName: "Blocks on Layer 2 of Advanced Digsite", actionVerb: "Break" },
        { xpPerAction: 20, actionName: "Blocks on Layer 3 of Advanced Digsite", actionVerb: "Break" },
        { xpPerAction: 25, actionName: "Blocks on Layer 4 of Advanced Digsite", actionVerb: "Break" },
        { xpPerAction: 35, actionName: "Blocks on Layer 5 of Advanced Digsite", actionVerb: "Break" },
    ],
    Fishing: [
        { xpPerAction: 25, actionName: "Items in Fishing Minigame", actionVerb: "Catch" },
    ],
    Eggs: [
        { xpPerAction: 0.5, actionName: "Eggs", actionVerb: "Hatch" },
        { xpPerAction: 25000, actionName: "Exclusive Eggs", actionVerb: "Hatch" },
    ],
    Economy: [
        { xpPerAction: 200, actionName: "items sold" },
    ],
    Pets: [
        { xpPerAction: 1 / 10, actionName: "Gold Pets", actionVerb: "Craft" },
        { xpPerAction: 4 / 10, actionName: "Rainbow Pets", actionVerb: "Craft" },

        { xpPerAction: 20, actionName: "Pets in Daycare", actionVerb: "Place" },
    ],
    "Superior Chests": [
        { xpPerAction: 6000, actionName: "Superior Chests", actionVerb: "Break" },
    ],
};

function openCalculator(masteryName) {
    document.getElementById('masteryForm').reset();
    document.getElementById('result').textContent = "";
    document.getElementById('masteryTitle').textContent = `${masteryName} Mastery Calculator`;
    document.getElementById('masteryForm').setAttribute('data-mastery', masteryName);
    document.getElementById('calculatorModal').style.display = "block";
}

function closeCalculator() {
    document.getElementById('calculatorModal').style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById('calculatorModal');
    if (event.target === modal) {
        closeCalculator();
    }
}

function calculateMasteryXP() {
    const masteryName = document.getElementById('masteryForm').getAttribute('data-mastery');
    const currentLevel = parseInt(document.getElementById('currentLevel').value);
    const targetLevel = parseInt(document.getElementById('targetLevel').value);
    const currentXP = parseInt(document.getElementById('currentXP').value);
    const hasBonus = document.getElementById('bonusXP').checked;

    if (currentLevel < 1 || currentLevel >= 99 || targetLevel <= currentLevel || targetLevel > 99 || currentXP < 0) {
        document.getElementById('result').innerHTML = "<span style='color: red;'>Invalid input. Please ensure levels are valid, and XP is a positive number.</span>";
        return;
    }

    let xpNeeded = 0;

    for (let i = currentLevel; i < targetLevel; i++) {
        xpNeeded += masteryLevelXP[i - 1].expToNext;
    }

    xpNeeded -= currentXP;

    if (hasBonus) {
        xpNeeded = xpNeeded / 1.1;
    }

    const masteryData = masteryXPData[masteryName];
    let resultText = `<strong>You need ${xpNeeded.toLocaleString()} more XP to reach level ${targetLevel}:</strong><br><br>`;

    resultText += "<ul>";
    masteryData.forEach(method => {
        let actionsNeeded = Math.ceil(xpNeeded / method.xpPerAction);

        resultText += `<li>${method.actionVerb} ${actionsNeeded.toLocaleString()} ${method.actionName}</li>`;
    });
    resultText += "</ul>";

    document.getElementById('result').innerHTML = resultText;
}

window.onclick = function(event) {
    const modal = document.getElementById('calculatorModal');
    if (event.target === modal) {
        closeCalculator();
    }
}