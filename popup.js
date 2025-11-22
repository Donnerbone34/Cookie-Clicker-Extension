// --- UPDATES CONFIGURATION ---
const updatesData = [
  { 
    version: "v1.4", 
    date: "Nov 23, 2025", 
    changes: [
      "Fixed Anti-Cheat 'False Positives'", 
      "Added Console Command Trap"
    ] 
  },
  { version: "v1.3", date: "Nov 22, 2025", changes: ["Added Infinite Numbers", "Enhanced Anti-Cheat"] },
  { version: "v1.2", date: "Nov 22, 2025", changes: ["Added ANTI-CHEAT System", "Polished UI"] },
  { version: "v1.1", date: "Nov 22, 2025", changes: ["Added Help Tab", "Added Bad Games loading screen"] },
  { version: "v1.0", date: "Nov 22, 2025", changes: ["Initial Release"] }
];

// --- CONFIG ---
const clickUpgradesConfig = [
  { id: 'plastic_mouse',  name: 'Plastic Mouse',  cost: 50,     power: 1,   img: 'images/plastic_mouse.png' },
  { id: 'iron_mouse',     name: 'Iron Mouse',     cost: 500,    power: 3,   img: 'images/iron_mouse.png' },
  { id: 'titanium_mouse', name: 'Titanium Mouse', cost: 2000,   power: 10,  img: 'images/titanium_mouse.png' },
  { id: 'diamond_mouse',  name: 'Diamond Mouse',  cost: 10000,  power: 50,  img: 'images/diamond_mouse.png' },
  { id: 'antimatter_mouse',name:'Antimatter Mouse',cost: 100000,power: 500, img: 'images/antimatter_mouse.png' }
];

// --- STATE (The Real Data) ---
let gameLoaded = false; 
let internalGame = {
  cookies: 0, cursors: 0, grandmas: 0, farms: 0, mines: 0, factories: 0,
  ownedUpgrades: [], prestigeLevel: 0, lastSaveTime: Date.now()
};

// --- THE TRAP (The Fake Variable) ---
// If anyone types "game.cookies =" in the console, this Proxy catches them.
var game = new Proxy(internalGame, {
  set: function(target, prop, value) {
    if (prop === 'cookies' || prop === 'prestigeLevel') {
      triggerAntiCheat(); // BUSTED!
      return true; 
    }
    target[prop] = value;
    return true;
  }
});

let currentPage = 1;
const updatesPerPage = 3; 
const costs = { cursor: 15, grandma: 100, farm: 1100, mine: 12000, factory: 130000 };
const production = { cursor: 0.5, grandma: 5, farm: 20, mine: 50, factory: 200 };

// --- DOM ---
const els = {
  loadingScreen: document.getElementById('loadingScreen'), 
  homeScreen: document.getElementById('homeScreen'),
  upgradesScreen: document.getElementById('upgradesScreen'),
  prestigeScreen: document.getElementById('prestigeScreen'),
  updatesScreen: document.getElementById('updatesScreen'),
  helpScreen: document.getElementById('helpScreen'),
  navUpgradesBtn: document.getElementById('navUpgradesBtn'),
  navPrestigeBtn: document.getElementById('navPrestigeBtn'),
  navUpdatesBtn: document.getElementById('navUpdatesBtn'),
  navHelpBtn: document.getElementById('navHelpBtn'),
  backToHomeFromUpgrades: document.getElementById('backToHomeFromUpgrades'),
  backToHomeFromPrestige: document.getElementById('backToHomeFromPrestige'),
  backToHomeFromUpdates: document.getElementById('backToHomeFromUpdates'),
  backToHomeFromHelp: document.getElementById('backToHomeFromHelp'),
  updateContentArea: document.getElementById('updateContentArea'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  pageIndicator: document.getElementById('pageIndicator'),
  clickUpgradeList: document.getElementById('clickUpgradeList'),
  cookieDisplay: document.getElementById('cookieDisplay'),
  cpsDisplay: document.getElementById('cpsDisplay'),
  cpcDisplay: document.getElementById('cpcDisplay'),
  doPrestigeBtn: document.getElementById('doPrestigeBtn'),
  currentMultDisplay: document.getElementById('currentMultDisplay'),
  prestigeLevelDisplay: document.getElementById('prestigeLevelDisplay'),
  messageBox: document.getElementById('messageBox'),
  bigCookie: document.getElementById('bigCookie'),
  resetBtn: document.getElementById('resetBtn')
};

// --- INIT ---
initGame();

function initGame() {
  loadGame();
  renderUpgradeList(); 
  renderUpdateLog(); 

  // 3 Second Loading Screen
  setTimeout(() => {
    els.loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      els.loadingScreen.style.display = 'none';
    }, 800); 
  }, 3000);
}

// --- LOOP ---
setInterval(() => {
  if (!gameLoaded) return; 
  
  // Note: The math-based Anti-Cheat is GONE.
  // You can now earn infinite cookies legitimately without crashing.

  const cps = calculateCPS();
  internalGame.cookies += cps; // Use internalGame so we don't trigger the trap
  internalGame.lastSaveTime = Date.now();
  updateUI();
  saveGame(); 
}, 1000);

function triggerAntiCheat() {
  // Punishment
  internalGame.cookies = 0;
  internalGame.prestigeLevel = 0; 
  internalGame.ownedUpgrades = []; 
  saveGame();

  // Scary Screen
  els.loadingScreen.style.display = 'flex';
  els.loadingScreen.classList.remove('fade-out');
  els.loadingScreen.classList.add('cheater-screen');
  
  const h1 = els.loadingScreen.querySelector('h1');
  const p = els.loadingScreen.querySelector('.loading-text');
  h1.textContent = "CHEATER DETECTED";
  if(p) {
    p.textContent = "Oh crumbs! It looks like you tried to bypass the hard work of baking by modifying the laws of the universe. We detected a console command that breaks the rules of the kitchen. Unfortunately, to keep things fair for honest bakers, we had to toss your entire stash into the bin and reset your progress. Please stick to clicking next time!";
    p.style.color = "#fff";
    p.style.fontWeight = "bold";
    p.style.animation = "none"; 
    p.style.padding = "0 20px"; 
    p.style.lineHeight = "1.5";
  }
}

// --- MATH & INFINITE FORMATTING ---
const suffixes = [
  "", " Million", " Billion", " Trillion", " Quadrillion", " Quintillion", 
  " Sextillion", " Septillion", " Octillion", " Nonillion", " Decillion", 
  " Undecillion", " Duodecillion", " Tredecillion", " Quattuordecillion", 
  " Quindecillion", " Sexdecillion", " Septendecillion", " Octodecillion", 
  " Novemdecillion", " Vigintillion"
];

function formatNumber(num) {
  if (num < 1000000) return Math.floor(num).toLocaleString();
  const suffixIndex = Math.floor(Math.log10(num) / 3) - 2;
  if (suffixIndex < suffixes.length) {
    const shortValue = (num / Math.pow(1000, suffixIndex + 2));
    return shortValue.toFixed(2) + suffixes[suffixIndex];
  }
  return num.toExponential(2).replace("+", "");
}

function getMultiplier() {
  if (!internalGame.prestigeLevel || internalGame.prestigeLevel === 0) return 1;
  return 2 + ((internalGame.prestigeLevel - 1) * 0.5);
}

function calculateCPS() {
  const rawCPS = (internalGame.cursors * production.cursor) + 
                 (internalGame.grandmas * production.grandma) +
                 (internalGame.farms * production.farm) +
                 (internalGame.mines * production.mine) +
                 (internalGame.factories * production.factory);
  return rawCPS * getMultiplier();
}

function calculateClickPower() {
  let power = 1; 
  clickUpgradesConfig.forEach(upg => {
    if (internalGame.ownedUpgrades.includes(upg.id)) {
      power += upg.power;
    }
  });
  return power * getMultiplier();
}

// --- UI ---
function updateUI() {
  els.cookieDisplay.textContent = formatNumber(internalGame.cookies);
  els.cpsDisplay.textContent = formatNumber(calculateCPS());
  els.cpcDisplay.textContent = formatNumber(calculateClickPower());
  
  updateBuildingUI('cursor');
  updateBuildingUI('grandma');
  updateBuildingUI('farm');
  updateBuildingUI('mine');
  updateBuildingUI('factory');

  updateUpgradeVisuals();
  
  els.currentMultDisplay.textContent = getMultiplier() + "x";
  els.prestigeLevelDisplay.textContent = internalGame.prestigeLevel;
}

function updateBuildingUI(type) {
  const countEl = document.getElementById(type + 'Count');
  const costEl = document.getElementById(type + 'Cost');
  let count = internalGame[type + 's'];
  if (isNaN(count)) count = 0;
  const currentCost = Math.floor(costs[type] * Math.pow(1.15, count));
  if(countEl) countEl.textContent = count;
  if(costEl) costEl.textContent = formatNumber(currentCost);
}

// --- ACTIONS ---
function clickCookie() {
  internalGame.cookies += calculateClickPower(); // LEGITIMATE GAIN
  updateUI();
  saveGame(); 
}

function buyBuilding(type) {
  const currentCount = internalGame[type + 's'];
  const baseCost = costs[type];
  const currentCost = Math.floor(baseCost * Math.pow(1.15, currentCount));
  if (internalGame.cookies >= currentCost) {
    internalGame.cookies -= currentCost;
    internalGame[type + 's']++;
    updateUI();
    saveGame(); 
  } else {
    showMessage("Not enough cookies!");
  }
}

function buyClickUpgrade(upg) {
  if (internalGame.ownedUpgrades.includes(upg.id)) return;
  if (internalGame.cookies >= upg.cost) {
    internalGame.cookies -= upg.cost;
    internalGame.ownedUpgrades.push(upg.id);
    updateUI();
    saveGame(); 
    showMessage(`Bought ${upg.name}!`);
  } else {
    showMessage("Not enough cookies!");
  }
}

function performPrestige() {
  if (internalGame.cookies < 1000000) {
    showMessage("Need 1 Million Cookies!");
    return;
  }
  if (confirm("Are you sure? You will lose all items but gain a Multiplier.")) {
    internalGame.prestigeLevel++;
    internalGame.cookies = 0;
    internalGame.cursors = 0;
    internalGame.grandmas = 0;
    internalGame.farms = 0;
    internalGame.mines = 0;
    internalGame.factories = 0;
    internalGame.ownedUpgrades = [];
    saveGame(); 
    renderUpgradeList(); 
    updateUI();
    switchScreen('home');
    showMessage("PRESTIGE SUCCESSFUL!");
  }
}

function showMessage(txt) {
  els.messageBox.textContent = txt;
  setTimeout(() => els.messageBox.textContent = "", 1500);
}

// --- SAVE/LOAD ---
function saveGame() {
  if (!gameLoaded) return; 
  chrome.storage.local.set({ 'cookieClickerSaveV5': internalGame });
}

function loadGame() {
  chrome.storage.local.get(['cookieClickerSaveV5'], function(result) {
    if (result.cookieClickerSaveV5) {
      const saved = result.cookieClickerSaveV5;
      internalGame = { ...internalGame, ...saved };
      
      const keys = ['cursors', 'grandmas', 'farms', 'mines', 'factories', 'prestigeLevel', 'cookies'];
      keys.forEach(key => {
        if (internalGame[key] === undefined || internalGame[key] === null || isNaN(internalGame[key])) {
          internalGame[key] = 0;
        }
      });
      
      const now = Date.now();
      const lastSave = internalGame.lastSaveTime || now;
      const secondsPassed = (now - lastSave) / 1000;
      if (secondsPassed > 0) {
        const earned = calculateCPS() * secondsPassed;
        if (earned > 0) {
          internalGame.cookies += earned;
          showMessage(`Earned ${Math.floor(earned)} offline!`);
        }
      }
    }
    gameLoaded = true; 
    updateUI();
  });
}

function resetGame() {
  if(confirm("Delete Save completely? This deletes Prestige too.")) {
    internalGame = { 
      cookies: 0, cursors: 0, grandmas: 0, farms: 0, mines: 0, factories: 0,
      ownedUpgrades: [], prestigeLevel: 0, lastSaveTime: Date.now() 
    };
    saveGame();
    renderUpgradeList(); 
    updateUI();
    showMessage("Full Reset.");
  }
}

// --- LISTENERS ---
els.bigCookie.addEventListener('click', clickCookie);
els.resetBtn.addEventListener('click', resetGame);
els.doPrestigeBtn.addEventListener('click', performPrestige);
document.getElementById('buyCursor').addEventListener('click', () => buyBuilding('cursor'));
document.getElementById('buyGrandma').addEventListener('click', () => buyBuilding('grandma'));
document.getElementById('buyFarm').addEventListener('click', () => buyBuilding('farm'));
document.getElementById('buyMine').addEventListener('click', () => buyBuilding('mine'));
document.getElementById('buyFactory').addEventListener('click', () => buyBuilding('factory'));

// Keyboard
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (document.activeElement.tagName === 'BUTTON') return;
    els.bigCookie.classList.add('pressed');
    clickCookie();
  }
});
document.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    els.bigCookie.classList.remove('pressed');
  }
});

// --- NAVIGATION ---
function switchScreen(screenName) {
  els.homeScreen.classList.add('hidden');
  els.upgradesScreen.classList.add('hidden');
  els.prestigeScreen.classList.add('hidden');
  els.updatesScreen.classList.add('hidden');
  els.helpScreen.classList.add('hidden'); 
  if (screenName === 'home') els.homeScreen.classList.remove('hidden');
  if (screenName === 'upgrades') els.upgradesScreen.classList.remove('hidden');
  if (screenName === 'prestige') els.prestigeScreen.classList.remove('hidden');
  if (screenName === 'updates') els.updatesScreen.classList.remove('hidden');
  if (screenName === 'help') els.helpScreen.classList.remove('hidden'); 
}
els.navUpgradesBtn.addEventListener('click', () => switchScreen('upgrades'));
els.navPrestigeBtn.addEventListener('click', () => switchScreen('prestige'));
els.navUpdatesBtn.addEventListener('click', () => switchScreen('updates'));
els.navHelpBtn.addEventListener('click', () => switchScreen('help')); 
els.backToHomeFromUpgrades.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromPrestige.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromUpdates.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromHelp.addEventListener('click', () => switchScreen('home')); 

function renderUpgradeList() {
  els.clickUpgradeList.innerHTML = ''; 
  clickUpgradesConfig.forEach(upg => {
    const div = document.createElement('div');
    div.className = 'upgrade';
    div.id = `upg-${upg.id}`;
    div.innerHTML = `<img src="${upg.img}" class="icon-img"><div class="info"><b>${upg.name}</b> (+${formatNumber(upg.power)} Click)<div class="cost">Cost: ${formatNumber(upg.cost)}</div></div>`;
    div.addEventListener('click', () => buyClickUpgrade(upg));
    els.clickUpgradeList.appendChild(div);
  });
}

function updateUpgradeVisuals() {
  clickUpgradesConfig.forEach(upg => {
    const div = document.getElementById(`upg-${upg.id}`);
    if (!div) return;
    if (internalGame.ownedUpgrades.includes(upg.id)) {
      div.classList.add('purchased');
      div.querySelector('.cost').textContent = "Owned";
    }
  });
}

function renderUpdateLog() {
  els.updateContentArea.innerHTML = ''; 
  const startIndex = (currentPage - 1) * updatesPerPage;
  const endIndex = startIndex + updatesPerPage;
  const currentUpdates = updatesData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(updatesData.length / updatesPerPage);
  currentUpdates.forEach(upd => {
    const entry = document.createElement('div');
    entry.className = 'update-entry';
    let listItems = '';
    upd.changes.forEach(change => { listItems += `<li>${change}</li>`; });
    entry.innerHTML = `<div class="update-version">${upd.version} <span class="update-date">${upd.date}</span></div><ul class="update-list">${listItems}</ul>`;
    els.updateContentArea.appendChild(entry);
  });
  els.pageIndicator.textContent = `${currentPage}/${totalPages || 1}`;
  els.prevPageBtn.disabled = (currentPage === 1);
  els.nextPageBtn.disabled = (currentPage === totalPages || totalPages === 0);
}
els.prevPageBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderUpdateLog(); } });
els.nextPageBtn.addEventListener('click', () => { const totalPages = Math.ceil(updatesData.length / updatesPerPage); if (currentPage < totalPages) { currentPage++; renderUpdateLog(); } });