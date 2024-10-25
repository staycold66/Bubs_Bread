const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const winMessage = document.getElementById('winMessage');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
const WIN_SCORE = 69;
let gameWon = false;

// Player (Bubs)
const bubs = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 36,
    height: 28,
    speed: 5,
    direction: 1 // 1 for right, -1 for left
};

// Bread array
const breads = [];
const BREAD_COUNT = 10;
const BREAD_SIZE = 32;

// Background pattern
const pattern = {
    offset: 0,
    speed: 0.5
};

// Movement controls
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Initialize bread positions
function initBreads() {
    for (let i = 0; i < BREAD_COUNT; i++) {
        spawnBread();
    }
}

// Spawn a new bread at random position
function spawnBread() {
    breads.push({
        x: Math.random() * (canvas.width - BREAD_SIZE),
        y: Math.random() * (canvas.height - BREAD_SIZE),
        width: BREAD_SIZE,
        height: BREAD_SIZE,
        rotation: Math.random() * Math.PI * 2
    });
}

// Draw pixel art dog (Bubs as a rat terrier)
function drawBubs() {
    const x = bubs.x;
    const y = bubs.y;
    
    // Main body (dark grey)
    ctx.fillStyle = '#404040';
    ctx.fillRect(x + 8, y + 8, 20, 14);
    
    // Head
    ctx.fillRect(x + (bubs.direction > 0 ? 20 : 4), y + 4, 12, 14);
    
    // Pointed ears (characteristic of rat terrier)
    ctx.fillStyle = '#404040';
    // Left ear
    if (bubs.direction > 0) {
        ctx.fillRect(x + 24, y - 2, 4, 8);
        ctx.fillRect(x + 22, y, 2, 6);
    } else {
        ctx.fillRect(x + 8, y - 2, 4, 8);
        ctx.fillRect(x + 12, y, 2, 6);
    }
    // Right ear
    if (bubs.direction > 0) {
        ctx.fillRect(x + 28, y, 4, 6);
        ctx.fillRect(x + 26, y + 2, 2, 4);
    } else {
        ctx.fillRect(x + 4, y, 4, 6);
        ctx.fillRect(x + 8, y + 2, 2, 4);
    }
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + (bubs.direction > 0 ? 28 : 4), y + 8, 3, 3);
    
    // Pointed snout
    if (bubs.direction > 0) {
        ctx.fillRect(x + 32, y + 10, 4, 4);
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 30, y + 11, 2, 2);
    } else {
        ctx.fillRect(x, y + 10, 4, 4);
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 4, y + 11, 2, 2);
    }
    
    // Legs
    ctx.fillStyle = '#404040';
    ctx.fillRect(x + 10, y + 22, 4, 6);
    ctx.fillRect(x + 22, y + 22, 4, 6);
    
    // Tail (shorter and upright like a rat terrier)
    if (bubs.direction > 0) {
        ctx.fillRect(x + 6, y + 6, 4, 8);
    } else {
        ctx.fillRect(x + 26, y + 6, 4, 8);
    }
}

// Draw french bread
function drawBread(bread) {
    ctx.save();
    ctx.translate(bread.x + BREAD_SIZE/2, bread.y + BREAD_SIZE/2);
    ctx.rotate(bread.rotation);
    
    const x = -BREAD_SIZE/2;
    const y = -BREAD_SIZE/2;
    
    // Main bread body (golden brown)
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(x + 4, y + 8, 24, 16);
    
    // Bread ends
    ctx.fillRect(x, y + 10, 4, 12);
    ctx.fillRect(x + 28, y + 10, 4, 12);
    
    // Lighter highlights
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 4, y + 8, 24, 4);
    
    // Darker crust details
    ctx.fillStyle = '#8B4513';
    // Diagonal slash marks
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 8 + (i * 8), y + 12, 4, 2);
    }
    
    // Bottom shadow
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x + 4, y + 20, 24, 4);
    
    ctx.restore();
}

// Draw background pattern
function drawBackground() {
    pattern.offset = (pattern.offset + pattern.speed) % 40;
    
    // Draw diagonal stripes
    for (let i = -800; i < canvas.width + 800; i += 40) {
        ctx.fillStyle = (Math.floor((i + pattern.offset) / 40) % 2 === 0) ? '#85DCBA' : '#97EAD2';
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 800, canvas.height);
        ctx.lineTo(i + 840, canvas.height);
        ctx.lineTo(i + 40, 0);
        ctx.closePath();
        ctx.fill();
    }
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Handle win condition
function handleWin() {
    gameWon = true;
    winMessage.classList.remove('hidden');
    // Stop spawning new bread
    breads.length = 0;
}

// Update game state
function update() {
    if (gameWon) return;

    // Move Bubs based on key presses
    if (keys.ArrowUp && bubs.y > 0) bubs.y -= bubs.speed;
    if (keys.ArrowDown && bubs.y < canvas.height - bubs.height) bubs.y += bubs.speed;
    if (keys.ArrowLeft && bubs.x > 0) {
        bubs.x -= bubs.speed;
        bubs.direction = -1;
    }
    if (keys.ArrowRight && bubs.x < canvas.width - bubs.width) {
        bubs.x += bubs.speed;
        bubs.direction = 1;
    }

    // Rotate breads
    breads.forEach(bread => {
        bread.rotation += 0.02;
    });

    // Check for bread collection
    for (let i = breads.length - 1; i >= 0; i--) {
        if (checkCollision(bubs, breads[i])) {
            breads.splice(i, 1);
            score++;
            scoreElement.textContent = score;
            
            // Check win condition
            if (score >= WIN_SCORE) {
                handleWin();
            } else {
                spawnBread();
            }
        }
    }
}

// Main draw function
function draw() {
    // Draw animated background
    drawBackground();

    // Draw breads
    breads.forEach(drawBread);

    // Draw Bubs
    drawBubs();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Start the game
initBreads();
gameLoop();
