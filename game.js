const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const endScreen = document.getElementById("end-screen");
const endKicker = document.getElementById("end-kicker");
const endTitle = document.getElementById("end-title");
const endCopy = document.getElementById("end-copy");
const scoreLabel = document.getElementById("score");
const heartsLabel = document.getElementById("hearts");
const progressLabel = document.getElementById("progress");
const bestScoreLabel = document.getElementById("best-score");

const WORLD_WIDTH = 5200;
const WORLD_HEIGHT = 720;
const assets = {};
const assetPaths = {
  player: "assets/sprites/Player_15.png",
  enemy: "assets/sprites/Enemie_15.png",
  coin: "assets/sprites/coin_gold.png",
  block: "assets/sprites/terrain_grass_block.png",
  blockTop: "assets/sprites/terrain_grass_horizontal_middle.png",
  flag: "assets/sprites/flag_green_a.png",
  spike: "assets/sprites/spikes.png",
  bush: "assets/sprites/bush.png",
  heart: "assets/sprites/heart.png",
};

Object.entries(assetPaths).forEach(([name, path]) => {
  const image = new Image();
  image.src = path;
  assets[name] = image;
});

const sounds = {
  jump: new Audio("assets/audio/jump.wav"),
  coin: new Audio("assets/audio/powerup.wav"),
  hit: new Audio("assets/audio/sharp-punch-soundbible.mp3"),
  win: new Audio(
    "assets/audio/brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3",
  ),
};
Object.values(sounds).forEach((sound) => {
  sound.volume = 0.25;
});

const keys = new Set();
let jumpQueued = false;
let running = false;
let lastTime = 0;
let cameraX = 0;
let score = 0;
let lives = 3;
let bestScore = Number(localStorage.getItem("skybound-best") || 0);
bestScoreLabel.textContent = String(bestScore).padStart(6, "0");

const player = {
  x: 120,
  y: 500,
  width: 44,
  height: 60,
  vx: 0,
  vy: 0,
  grounded: false,
  invincible: 0,
  facing: 1,
};
const spawn = { x: 120, y: 500 };
const platforms = [
  { x: 0, y: 610, width: 590, height: 110 },
  { x: 710, y: 610, width: 480, height: 110 },
  { x: 1310, y: 610, width: 430, height: 110 },
  { x: 1870, y: 610, width: 700, height: 110 },
  { x: 2750, y: 610, width: 1050, height: 110 },
  { x: 3970, y: 610, width: 450, height: 110 },
  { x: 4550, y: 610, width: 650, height: 110 },
  { x: 275, y: 490, width: 180, height: 24 },
  { x: 810, y: 455, width: 170, height: 24 },
  { x: 1070, y: 350, width: 175, height: 24 },
  { x: 1450, y: 460, width: 180, height: 24 },
  { x: 1650, y: 365, width: 180, height: 24 },
  { x: 2020, y: 475, width: 180, height: 24 },
  { x: 2310, y: 370, width: 190, height: 24 },
  { x: 2890, y: 465, width: 185, height: 24 },
  { x: 3170, y: 350, width: 200, height: 24 },
  { x: 3440, y: 470, width: 150, height: 24 },
  { x: 3650, y: 330, width: 170, height: 24 },
  { x: 4050, y: 390, width: 170, height: 24 },
  { x: 4380, y: 300, width: 155, height: 24 },
  { x: 4660, y: 460, width: 180, height: 24 },
  { x: 4920, y: 350, width: 180, height: 24 },
];
const movingPlatforms = [
  {
    x: 3800,
    baseX: 3800,
    y: 475,
    width: 145,
    height: 24,
    range: 145,
    speed: 0.9,
    direction: 1,
  },
  {
    x: 4250,
    baseX: 4250,
    y: 505,
    width: 135,
    height: 24,
    range: 120,
    speed: 1.15,
    direction: -1,
  },
  {
    x: 4480,
    baseX: 4480,
    y: 420,
    width: 120,
    height: 24,
    range: 90,
    speed: 0.8,
    direction: 1,
  },
];
const coins = [
  [330, 430],
  [400, 430],
  [850, 395],
  [915, 395],
  [1115, 290],
  [1180, 290],
  [1495, 400],
  [1710, 305],
  [2075, 415],
  [2140, 415],
  [2370, 310],
  [2440, 310],
  [2940, 405],
  [3005, 405],
  [3230, 290],
  [3300, 290],
  [3500, 420],
  [3690, 270],
  [3840, 415],
  [4085, 330],
  [4280, 450],
  [4430, 240],
  [4710, 410],
  [4970, 290],
  [5120, 550],
].map(([x, y]) => ({ x, y, collected: false, phase: Math.random() * 6 }));
const enemies = [
  {
    x: 455,
    y: 550,
    width: 45,
    height: 58,
    min: 360,
    max: 545,
    vx: 1.2,
    alive: true,
  },
  {
    x: 885,
    y: 395,
    width: 45,
    height: 58,
    min: 805,
    max: 945,
    vx: 1,
    alive: true,
  },
  {
    x: 1505,
    y: 550,
    width: 45,
    height: 58,
    min: 1360,
    max: 1690,
    vx: 1.45,
    alive: true,
  },
  {
    x: 2150,
    y: 550,
    width: 45,
    height: 58,
    min: 1930,
    max: 2470,
    vx: 1.2,
    alive: true,
  },
  {
    x: 3020,
    y: 550,
    width: 45,
    height: 58,
    min: 2800,
    max: 3250,
    vx: 1.4,
    alive: true,
  },
  {
    x: 3470,
    y: 410,
    width: 45,
    height: 58,
    min: 3440,
    max: 3540,
    vx: 1.1,
    alive: true,
  },
  {
    x: 4680,
    y: 550,
    width: 45,
    height: 58,
    min: 4580,
    max: 5000,
    vx: 1.7,
    alive: true,
  },
];
const spikes = [
  { x: 550, y: 580, width: 42, height: 30 },
  { x: 1190, y: 580, width: 42, height: 30 },
  { x: 1730, y: 580, width: 42, height: 30 },
  { x: 2540, y: 580, width: 42, height: 30 },
  { x: 2840, y: 580, width: 42, height: 30 },
  { x: 3150, y: 580, width: 42, height: 30 },
  { x: 3760, y: 580, width: 42, height: 30 },
  { x: 4130, y: 580, width: 42, height: 30 },
  { x: 4780, y: 580, width: 42, height: 30 },
];
const flag = { x: 5100, y: 500, width: 70, height: 110 };

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function resetGame() {
  keys.clear();
  jumpQueued = false;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.invincible = 0;
  cameraX = 0;
  score = 0;
  lives = 3;
  coins.forEach((coin) => {
    coin.collected = false;
  });
  enemies.forEach((enemy) => {
    enemy.alive = true;
  });
  movingPlatforms.forEach((platform) => {
    platform.x = platform.baseX;
    platform.direction = platform.direction > 0 ? 1 : -1;
  });
  updateHud();
}

function startGame() {
  if (running) return;
  resetGame();
  running = true;
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("restart-button").addEventListener("click", startGame);

window.addEventListener("keydown", (event) => {
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w"].includes(
      event.key,
    )
  )
    event.preventDefault();
  keys.add(event.key.toLowerCase());
  if ([" ", "arrowup", "w"].includes(event.key.toLowerCase()) && !event.repeat)
    jumpQueued = true;
});
window.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const down = (event) => {
    event.preventDefault();
    if (control === "jump") jumpQueued = true;
    else keys.add(control === "left" ? "arrowleft" : "arrowright");
  };
  const up = (event) => {
    event.preventDefault();
    if (control !== "jump")
      keys.delete(control === "left" ? "arrowleft" : "arrowright");
  };
  button.addEventListener("touchstart", down, { passive: false });
  button.addEventListener("touchend", up, { passive: false });
  button.addEventListener("mousedown", down);
  button.addEventListener("mouseup", up);
  button.addEventListener("mouseleave", up);
});

function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update(dt) {
  for (const platform of movingPlatforms) {
    platform.x += platform.speed * platform.direction * dt;
    if (Math.abs(platform.x - platform.baseX) >= platform.range) {
      platform.direction *= -1;
    }
  }
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const acceleration = 0.8 * dt;
  if (left) {
    player.vx -= acceleration;
    player.facing = -1;
  }
  if (right) {
    player.vx += acceleration;
    player.facing = 1;
  }
  if (!left && !right) player.vx *= Math.pow(0.78, dt);
  player.vx = Math.max(-5.6, Math.min(5.6, player.vx));
  if (jumpQueued && player.grounded) {
    player.vy = -13.5;
    player.grounded = false;
    playSound(sounds.jump);
  }
  jumpQueued = false;
  player.vy += 0.65 * dt;
  player.vy = Math.min(player.vy, 15);

  const previousBottom = player.y + player.height;
  player.x += player.vx * dt;
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));
  player.y += player.vy * dt;
  player.grounded = false;
  for (const platform of platforms.concat(movingPlatforms)) {
    const crossing =
      previousBottom <= platform.y && player.y + player.height >= platform.y;
    const horizontal =
      player.x + player.width - 7 > platform.x &&
      player.x + 7 < platform.x + platform.width;
    if (player.vy >= 0 && crossing && horizontal) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  }

  if (player.y > WORLD_HEIGHT + 80) takeDamage();
  if (player.invincible > 0) player.invincible -= dt;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    enemy.x += enemy.vx * dt;
    if (enemy.x < enemy.min || enemy.x > enemy.max) enemy.vx *= -1;
    if (overlaps(player, enemy) && player.invincible <= 0) {
      if (player.vy > 1 && player.y + player.height - enemy.y < 24) {
        enemy.alive = false;
        player.vy = -8;
        score += 250;
        playSound(sounds.hit);
      } else takeDamage();
    }
  }
  for (const spike of spikes)
    if (overlaps(player, spike) && player.invincible <= 0) takeDamage();
  for (const coin of coins) {
    if (
      !coin.collected &&
      overlaps(player, {
        x: coin.x - 12,
        y: coin.y - 12,
        width: 24,
        height: 24,
      })
    ) {
      coin.collected = true;
      score += 100;
      playSound(sounds.coin);
    }
  }
  if (
    overlaps(player, {
      x: flag.x,
      y: flag.y,
      width: flag.width,
      height: flag.height,
    })
  )
    finishGame(true);
  cameraX += (player.x - 360 - cameraX) * 0.08;
  cameraX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, cameraX));
  updateHud();
}

function takeDamage() {
  if (player.invincible > 0) return;
  lives -= 1;
  playSound(sounds.hit);
  player.invincible = 100;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  if (lives <= 0) finishGame(false);
}

function finishGame(won) {
  running = false;
  if (won) {
    score += lives * 500;
    endKicker.textContent = "MISSION ACCOMPLIE";
    endTitle.textContent = "Bravo, coureur.";
    endCopy.textContent = `Tu as franchi la frontière avec ${score} points.`;
    playSound(sounds.win);
  } else {
    endKicker.textContent = "SIGNAL PERDU";
    endTitle.textContent = "La route attend.";
    endCopy.textContent =
      "Reprends ton souffle et tente une nouvelle traversée.";
  }
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("skybound-best", bestScore);
    bestScoreLabel.textContent = String(bestScore).padStart(6, "0");
  }
  endScreen.classList.remove("hidden");
}

function updateHud() {
  heartsLabel.textContent = `${"♥ ".repeat(Math.max(0, lives)).trim()}${lives === 0 ? "·" : ""}`;
  scoreLabel.textContent = String(score).padStart(6, "0");
  progressLabel.style.width = `${Math.min(100, (player.x / (flag.x + 50)) * 100)}%`;
}

function drawImage(name, x, y, width, height, flip = false) {
  const image = assets[name];
  if (!image || !image.complete || !image.naturalWidth) return false;
  ctx.save();
  if (flip) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0, width, height);
  } else ctx.drawImage(image, x, y, width, height);
  ctx.restore();
  return true;
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#182b43");
  sky.addColorStop(0.62, "#6d9e9a");
  sky.addColorStop(1, "#d8c878");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(249, 235, 165, .75)";
  ctx.beginPath();
  ctx.arc(1020 - cameraX * 0.08, 120, 62, 0, Math.PI * 2);
  ctx.fill();
  drawMountainLayer(0.12, "#314e58", 450, 150);
  drawMountainLayer(0.24, "#243e4d", 520, 180);
  drawMountainLayer(0.42, "#1a3040", 585, 210);
}

function drawMountainLayer(speed, color, base, height) {
  ctx.fillStyle = color;
  const offset = -(cameraX * speed) % 620;
  for (let x = offset - 620; x < canvas.width + 620; x += 620) {
    ctx.beginPath();
    ctx.moveTo(x, base + 90);
    ctx.lineTo(x + 120, base - height * 0.55);
    ctx.lineTo(x + 230, base + 10);
    ctx.lineTo(x + 355, base - height);
    ctx.lineTo(x + 500, base + 30);
    ctx.lineTo(x + 620, base - height * 0.4);
    ctx.lineTo(x + 700, base + 90);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWorld(time) {
  ctx.save();
  ctx.translate(-cameraX, 0);
  for (const platform of platforms.concat(movingPlatforms)) {
    ctx.fillStyle = "#182b30";
    ctx.fillRect(platform.x, platform.y + 10, platform.width, platform.height);
    for (let x = platform.x; x < platform.x + platform.width; x += 40) {
      const width = Math.min(40, platform.x + platform.width - x);
      if (
        !drawImage("block", x, platform.y, width, Math.min(42, platform.height))
      ) {
        ctx.fillStyle = "#45735c";
        ctx.fillRect(x, platform.y, width, 42);
      }
      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(x, platform.y + 42, width, platform.height - 42);
    }
  }
  for (const coin of coins) {
    if (coin.collected) continue;
    const bob = Math.sin(time * 0.005 + coin.phase) * 5;
    if (!drawImage("coin", coin.x - 15, coin.y - 18 + bob, 30, 36)) {
      ctx.fillStyle = "#f7c94b";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y + bob, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const spike of spikes) {
    if (!drawImage("spike", spike.x, spike.y, spike.width, spike.height)) {
      ctx.fillStyle = "#e6edf0";
      ctx.beginPath();
      ctx.moveTo(spike.x, spike.y + spike.height);
      ctx.lineTo(spike.x + spike.width / 2, spike.y);
      ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
      ctx.fill();
    }
  }
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    if (
      !drawImage(
        "enemy",
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height,
        enemy.vx < 0,
      )
    ) {
      ctx.fillStyle = "#e46c5f";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  }
  if (!drawImage("flag", flag.x, flag.y, 48, 110)) {
    ctx.fillStyle = "#f3f0d8";
    ctx.fillRect(flag.x + 12, flag.y, 5, 110);
    ctx.fillStyle = "#d4f36a";
    ctx.fillRect(flag.x + 17, flag.y + 8, 45, 28);
  }
  if (player.invincible <= 0 || Math.floor(player.invincible / 7) % 2 === 0) {
    if (
      !drawImage(
        "player",
        player.x,
        player.y,
        player.width,
        player.height,
        player.facing < 0,
      )
    ) {
      ctx.fillStyle = "#d4f36a";
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
  }
  ctx.restore();
}

function draw(time) {
  drawBackground();
  drawWorld(time);
  if (running) {
    ctx.fillStyle = "rgba(10, 19, 28, .5)";
    ctx.font = "700 11px Space Mono";
    ctx.fillText("RUN 01", 26, canvas.height - 28);
    ctx.fillText("REACH THE FLAG", canvas.width - 145, canvas.height - 28);
  }
}

function loop(time) {
  if (!running) {
    draw(time);
    return;
  }
  const dt = Math.min(2, (time - lastTime) / 16.67);
  lastTime = time;
  update(dt);
  draw(time);
  requestAnimationFrame(loop);
}

draw(0);
