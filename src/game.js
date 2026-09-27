const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const world = { width: 7200, height: 900 };
const camera = { x: 0, y: 0 };
const keys = new Set();
const mouse = { x: 720, y: 340, down: false };
const state = { running: true, paused: false, alert: 0, score: 0, lastTime: 0 };
const images = {};
const assetPaths = {
  player: "assets/runtime/sprites/Player_15.png",
  enemy: "assets/runtime/sprites/Enemie_15.png",
  coin: "assets/runtime/sprites/coin_gold.png",
  gem: "assets/runtime/sprites/gem_green.png",
  ammo: "assets/pack/icons/post-apocalypse-ammunition/PNG/without background/Post-Ammo1.png",
  sky: "assets/pack/backgrounds/post-apocalyptic/PNG/Postapocalypce3/Bright/sky.png",
  horizon:
    "assets/pack/backgrounds/post-apocalyptic/PNG/Postapocalypce3/Bright/sand_back.png",
  terrain:
    "assets/pack/backgrounds/post-apocalyptic/PNG/Postapocalypce3/Bright/postapocalypse3.png",
};
Object.entries(assetPaths).forEach(([name, path]) => {
  const image = new Image();
  image.src = path;
  images[name] = image;
});
const sounds = {
  step: new Audio("assets/runtime/audio/Walking_sound.mp3"),
  pickup: new Audio("assets/runtime/audio/powerup.wav"),
  hit: new Audio("assets/runtime/audio/sharp-punch-soundbible.mp3"),
  win: new Audio(
    "assets/runtime/audio/brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3",
  ),
};
sounds.step.volume = 0.1;
sounds.pickup.volume = 0.25;
sounds.hit.volume = 0.2;
sounds.win.volume = 0.3;

const player = {
  x: 160,
  y: 560,
  width: 42,
  height: 62,
  vx: 0,
  vy: 0,
  grounded: false,
  crouch: false,
  health: 100,
  stamina: 100,
  cells: 0,
  ammo: 12,
  scrap: 0,
  fireCooldown: 0,
  invulnerable: 0,
  facing: 1,
};
const platforms = [
  { x: 0, y: 650, w: 850, h: 250 },
  { x: 980, y: 650, w: 980, h: 250 },
  { x: 2110, y: 650, w: 880, h: 250 },
  { x: 3140, y: 650, w: 1130, h: 250 },
  { x: 4420, y: 650, w: 930, h: 250 },
  { x: 5500, y: 650, w: 1700, h: 250 },
  { x: 270, y: 500, w: 260, h: 28 },
  { x: 650, y: 390, w: 190, h: 28 },
  { x: 1110, y: 500, w: 240, h: 28 },
  { x: 1420, y: 390, w: 230, h: 28 },
  { x: 1740, y: 285, w: 180, h: 28 },
  { x: 2230, y: 480, w: 260, h: 28 },
  { x: 2570, y: 340, w: 240, h: 28 },
  { x: 3270, y: 490, w: 270, h: 28 },
  { x: 3650, y: 370, w: 230, h: 28 },
  { x: 3970, y: 250, w: 230, h: 28 },
  { x: 4540, y: 470, w: 230, h: 28 },
  { x: 4880, y: 340, w: 230, h: 28 },
  { x: 5320, y: 480, w: 260, h: 28 },
  { x: 5800, y: 370, w: 250, h: 28 },
  { x: 6230, y: 260, w: 220, h: 28 },
  { x: 6600, y: 470, w: 250, h: 28 },
];
const hazards = [
  { x: 800, y: 620, w: 42 },
  { x: 1870, y: 620, w: 42 },
  { x: 2870, y: 620, w: 42 },
  { x: 4200, y: 620, w: 42 },
  { x: 5270, y: 620, w: 42 },
  { x: 6120, y: 620, w: 42 },
];
const beacons = [
  { x: 720, y: 575, activated: false, sector: "01 / RUST YARD" },
  { x: 1510, y: 325, activated: false, sector: "02 / FLOODLINE" },
  { x: 2740, y: 275, activated: false, sector: "03 / RELAY FARM" },
  { x: 4050, y: 185, activated: false, sector: "04 / DUSTLINE" },
];
const loot = [
  { x: 430, y: 445, kind: "scrap", taken: false },
  { x: 1210, y: 445, kind: "ammo", taken: false },
  { x: 1790, y: 230, kind: "med", taken: false },
  { x: 2370, y: 425, kind: "scrap", taken: false },
  { x: 3730, y: 315, kind: "ammo", taken: false },
  { x: 4710, y: 415, kind: "med", taken: false },
  { x: 5860, y: 315, kind: "scrap", taken: false },
];
const guards = [
  {
    x: 560,
    y: 592,
    min: 350,
    max: 790,
    direction: 1,
    speed: 0.65,
    angle: 0,
    state: "patrol",
  },
  {
    x: 1240,
    y: 442,
    min: 1110,
    max: 1340,
    direction: -1,
    speed: 0.7,
    angle: 3,
    state: "patrol",
  },
  {
    x: 1600,
    y: 592,
    min: 1260,
    max: 1900,
    direction: 1,
    speed: 0.8,
    angle: 0,
    state: "patrol",
  },
  {
    x: 2340,
    y: 422,
    min: 2230,
    max: 2470,
    direction: 1,
    speed: 0.7,
    angle: 3,
    state: "patrol",
  },
  {
    x: 3420,
    y: 592,
    min: 3180,
    max: 3930,
    direction: -1,
    speed: 0.85,
    angle: 3,
    state: "patrol",
  },
  {
    x: 4690,
    y: 412,
    min: 4540,
    max: 4750,
    direction: 1,
    speed: 0.72,
    angle: 0,
    state: "patrol",
  },
  {
    x: 6010,
    y: 592,
    min: 5700,
    max: 6500,
    direction: -1,
    speed: 0.9,
    angle: 3,
    state: "patrol",
  },
];
const bullets = [];
const train = { x: 6840, y: 510, w: 280, h: 140 };

function play(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.width > b.x &&
    a.y < b.y + b.h &&
    a.y + a.height > b.y
  );
}
function solidAt(rect) {
  return platforms.some(
    (platform) =>
      rect.x < platform.x + platform.w &&
      rect.x + rect.w > platform.x &&
      rect.y < platform.y + platform.h &&
      rect.y + rect.h > platform.y,
  );
}
function nearestPlatform() {
  return platforms
    .filter(
      (platform) =>
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.w &&
        player.y + player.height <= platform.y + 40,
    )
    .sort((a, b) => a.y - b.y)[0];
}
function center(entity) {
  return {
    x: entity.x + (entity.width || 40) / 2,
    y: entity.y + (entity.height || 40) / 2,
  };
}
function playerNoise() {
  return player.crouch ? 5 : keys.has("shift") ? 100 : 38;
}
function isVisible(guard) {
  const p = center(player);
  const g = center(guard);
  const dx = p.x - g.x;
  const dy = p.y - g.y;
  const range = player.crouch ? 210 : 390;
  const targetAngle = Math.atan2(dy, dx);
  const difference = Math.abs(
    Math.atan2(
      Math.sin(targetAngle - guard.angle),
      Math.cos(targetAngle - guard.angle),
    ),
  );
  return Math.hypot(dx, dy) < range && difference < 0.62;
}
function tryMove(dx) {
  const next = {
    x: player.x + dx,
    y: player.y,
    w: player.width,
    h: player.height,
  };
  if (!solidAt(next)) player.x += dx;
}
function jump() {
  if (player.grounded && player.stamina > 8) {
    player.vy = -9.2;
    player.grounded = false;
    player.stamina -= 8;
  }
}
function fire() {
  if (player.fireCooldown > 0 || player.ammo <= 0) return;
  const p = center(player);
  const targetX = mouse.x + camera.x;
  const targetY = mouse.y + camera.y;
  const angle = Math.atan2(targetY - p.y, targetX - p.x);
  bullets.push({
    x: p.x,
    y: p.y + 6,
    vx: Math.cos(angle) * 12,
    vy: Math.sin(angle) * 12,
    life: 55,
  });
  player.ammo -= 1;
  player.fireCooldown = 15;
  state.alert = Math.max(state.alert, 75);
}
function interact() {
  const nearBeacon = beacons.find(
    (beacon) =>
      !beacon.activated &&
      Math.hypot(player.x - beacon.x, player.y - beacon.y) < 85,
  );
  const item = loot.find(
    (entry) =>
      !entry.taken && Math.hypot(player.x - entry.x, player.y - entry.y) < 60,
  );
  if (nearBeacon) {
    nearBeacon.activated = true;
    player.cells += 1;
    state.score += 300;
    state.alert = Math.max(0, state.alert - 25);
    play(sounds.pickup);
    return;
  }
  if (item) {
    item.taken = true;
    if (item.kind === "ammo") player.ammo += 6;
    if (item.kind === "med") player.health = Math.min(100, player.health + 25);
    if (item.kind === "scrap") player.scrap += 1;
    state.score += 80;
    play(sounds.pickup);
  }
}
function updatePlayer(dt) {
  const left = keys.has("a");
  const right = keys.has("d");
  const sprint = keys.has("shift") && player.stamina > 1;
  player.crouch = keys.has("control") || keys.has("c");
  const speed = (sprint ? 4.15 : player.crouch ? 1.2 : 2.55) * dt;
  if (left || right) {
    const direction = right ? 1 : -1;
    player.facing = direction;
    tryMove(direction * speed);
  }
  player.vx = right ? 1 : left ? -1 : 0;
  if ((keys.has("w") || keys.has(" ")) && !keys.has("jumpLock")) {
    jump();
    keys.add("jumpLock");
  }
  if (!keys.has("w") && !keys.has(" ")) keys.delete("jumpLock");
  player.vy += 0.48 * dt;
  const nextY = player.y + player.vy * dt;
  const floor = platforms.find(
    (platform) =>
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.w &&
      player.y + player.height <= platform.y + 24 &&
      nextY + player.height >= platform.y,
  );
  if (floor && player.vy >= 0) {
    player.y = floor.y - player.height;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.y = nextY;
    player.grounded = false;
  }
  if (player.y > world.height) {
    player.x = Math.max(120, player.x - 220);
    player.y = 500;
    player.health -= 20;
  }
  player.stamina += (sprint ? -24 : 15) * dt;
  player.stamina = Math.max(0, Math.min(100, player.stamina));
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  if (mouse.down || keys.has("f")) fire();
}
function updateGuards(dt) {
  guards.forEach((guard) => {
    const p = center(player);
    const g = center(guard);
    const detected =
      isVisible(guard) ||
      (playerNoise() > 70 &&
        Math.abs(player.x - guard.x) < 260 &&
        Math.abs(player.y - guard.y) < 110);
    if (detected) {
      guard.state = "alert";
      state.alert = Math.min(100, state.alert + 31 * dt);
      guard.angle = Math.atan2(p.y - g.y, p.x - g.x);
    } else if (guard.state === "alert") {
      state.alert = Math.max(0, state.alert - 5 * dt);
      if (state.alert < 14) guard.state = "search";
    } else {
      guard.state = "patrol";
      guard.x += guard.direction * guard.speed * dt;
      guard.angle = guard.direction > 0 ? 0 : Math.PI;
      if (guard.x < guard.min || guard.x > guard.max) guard.direction *= -1;
    }
    if (
      guard.state === "alert" &&
      Math.hypot(p.x - g.x, p.y - g.y) < 42 &&
      player.invulnerable <= 0
    ) {
      player.health -= 18;
      player.invulnerable = 35;
      play(sounds.hit);
    }
  });
}
function updateBullets(dt) {
  bullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    guards.forEach((guard) => {
      if (Math.hypot(bullet.x - guard.x, bullet.y - guard.y) < 28) {
        guard.state = "search";
        guard.x += 70;
        bullet.life = 0;
        state.score += 55;
      }
    });
  });
  for (let index = bullets.length - 1; index >= 0; index -= 1)
    if (bullets[index].life <= 0) bullets.splice(index, 1);
}
function updateCamera() {
  camera.x += (player.x - WIDTH * 0.35 - camera.x) * 0.1;
  camera.y += (player.y - HEIGHT * 0.55 - camera.y) * 0.1;
  camera.x = Math.max(0, Math.min(world.width - WIDTH, camera.x));
  camera.y = Math.max(0, Math.min(world.height - HEIGHT, camera.y));
}
function updateObjective() {
  const complete = beacons.every((beacon) => beacon.activated);
  document.getElementById("objective").textContent = complete
    ? "Rejoindre le train d'évacuation"
    : "Activer les 4 balises de secteur";
  document.getElementById("objective-detail").textContent = complete
    ? "4 / 4 balises • extraction ouverte"
    : `${player.cells} / 4 balises • explorer la Dustline`;
  document.getElementById("health-value").textContent = Math.max(
    0,
    Math.round(player.health),
  );
  document.getElementById("stamina-value").textContent = Math.round(
    player.stamina,
  );
  document.getElementById("health-meter").style.width =
    `${Math.max(0, player.health)}%`;
  document.getElementById("stamina-meter").style.width = `${player.stamina}%`;
  document.getElementById("scrap-count").textContent =
    `CELLS ${String(player.cells).padStart(2, "0")}`;
  document.getElementById("medkit-count").textContent =
    `SCRAP ${String(player.scrap).padStart(2, "0")}`;
  document.getElementById("ammo-count").textContent =
    `AMMO ${String(player.ammo).padStart(2, "0")}`;
  document.getElementById("mission-state").textContent =
    state.alert > 65 ? "PURSUIT" : state.alert > 20 ? "SEARCH" : "DUSTLINE RUN";
  document
    .getElementById("alert-banner")
    .classList.toggle("hidden", state.alert < 65);
  const near =
    beacons.some(
      (beacon) =>
        !beacon.activated &&
        Math.hypot(player.x - beacon.x, player.y - beacon.y) < 85,
    ) ||
    loot.some(
      (item) =>
        !item.taken && Math.hypot(player.x - item.x, player.y - item.y) < 60,
    );
  document.getElementById("interact-prompt").classList.toggle("hidden", !near);
}
function drawImage(name, x, y, width, height, alpha = 1) {
  const image = images[name];
  if (!image.complete || !image.naturalWidth) return false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, y, width, height);
  ctx.globalAlpha = 1;
  return true;
}
function drawWorld() {
  ctx.fillStyle = "#131f20";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (images.sky.complete) {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      images.sky,
      -camera.x * 0.06,
      -camera.y * 0.02,
      world.width,
      HEIGHT,
    );
    ctx.globalAlpha = 1;
  }
  if (images.horizon.complete) {
    ctx.globalAlpha = 0.35;
    ctx.drawImage(
      images.horizon,
      -camera.x * 0.15,
      190 - camera.y * 0.08,
      world.width,
      520,
    );
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.fillStyle = "rgba(7,14,16,.72)";
  ctx.fillRect(0, 0, world.width, world.height);
  if (images.terrain.complete) {
    ctx.globalAlpha = 0.16;
    ctx.drawImage(images.terrain, 0, 0, world.width, world.height);
    ctx.globalAlpha = 1;
  }
  platforms.forEach((platform) => {
    ctx.fillStyle = "#293a35";
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "rgba(214,237,104,.18)";
    ctx.fillRect(platform.x, platform.y, platform.w, 5);
    ctx.strokeStyle = "rgba(232,234,217,.16)";
    ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
  });
  hazards.forEach((hazard) => {
    ctx.fillStyle = "#ef765c";
    for (let x = hazard.x; x < hazard.x + hazard.w; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, hazard.y + 30);
      ctx.lineTo(x + 6, hazard.y);
      ctx.lineTo(x + 12, hazard.y + 30);
      ctx.fill();
    }
  });
  beacons.forEach((beacon) => {
    ctx.fillStyle = beacon.activated ? "#d6ed68" : "#e7b45d";
    ctx.fillRect(beacon.x - 5, beacon.y - 80, 10, 80);
    ctx.beginPath();
    ctx.arc(
      beacon.x,
      beacon.y - 85,
      beacon.activated ? 16 : 11 + Math.sin(performance.now() / 180) * 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#0c1717";
    ctx.fillRect(beacon.x - 18, beacon.y - 45, 36, 22);
  });
  loot.forEach((item) => {
    if (!item.taken) {
      const icon =
        item.kind === "ammo" ? "ammo" : item.kind === "med" ? "gem" : "coin";
      drawImage(icon, item.x - 15, item.y - 25, 30, 30) ||
        ((ctx.fillStyle = item.kind === "med" ? "#ef765c" : "#e7b45d"),
        ctx.fillRect(item.x - 10, item.y - 20, 20, 20));
    }
  });
  guards.forEach((guard) => {
    ctx.save();
    ctx.globalAlpha = guard.state === "alert" ? 0.2 : 0.09;
    ctx.fillStyle = guard.state === "alert" ? "#ef765c" : "#e7b45d";
    ctx.beginPath();
    ctx.moveTo(guard.x + 20, guard.y + 30);
    ctx.arc(
      guard.x + 20,
      guard.y + 30,
      300,
      guard.angle - 0.5,
      guard.angle + 0.5,
    );
    ctx.lineTo(guard.x + 20, guard.y + 30);
    ctx.fill();
    ctx.restore();
    drawImage("enemy", guard.x, guard.y, 44, 54) ||
      ((ctx.fillStyle = guard.state === "alert" ? "#ef765c" : "#e7b45d"),
      ctx.fillRect(guard.x, guard.y, 40, 48));
  });
  bullets.forEach((bullet) => {
    ctx.fillStyle = "#d6ed68";
    ctx.fillRect(bullet.x - 3, bullet.y - 2, 10, 4);
  });
  drawImage("player", player.x, player.y, player.width, player.height) ||
    ((ctx.fillStyle = "#d6ed68"),
    ctx.fillRect(player.x, player.y, player.width, player.height));
  if (player.crouch) {
    ctx.fillStyle = "rgba(214,237,104,.26)";
    ctx.fillRect(
      player.x - 4,
      player.y + player.height - 5,
      player.width + 8,
      5,
    );
  }
  ctx.fillStyle = "#e7b45d";
  ctx.fillRect(train.x, train.y, train.w, train.h);
  ctx.fillStyle = "#101817";
  ctx.fillRect(train.x + 25, train.y + 30, train.w - 50, 55);
  ctx.fillStyle = "#d6ed68";
  ctx.font = "11px Space Mono";
  ctx.fillText("EVAC TRAIN", train.x + 76, train.y + 116);
  ctx.restore();
}
function finish(success) {
  state.running = false;
  document.getElementById("result-panel").classList.remove("hidden");
  document.getElementById("result-kicker").textContent = success
    ? "RUN COMPLETE"
    : "SIGNAL LOST";
  document.getElementById("result-title").textContent = success
    ? "Le train part."
    : "La Dustline t’a repéré.";
  document.getElementById("result-copy").textContent = success
    ? `Traversée réussie. Score : ${state.score}.`
    : "Le secteur est en alerte. Recommence en restant dans l’ombre.";
  if (success) play(sounds.win);
}
function update(dt) {
  if (!state.running || state.paused) return;
  updatePlayer(dt);
  updateGuards(dt);
  updateBullets(dt);
  if (
    beacons.every((beacon) => beacon.activated) &&
    player.x > train.x - 140 &&
    player.x < train.x + train.w
  )
    finish(true);
  if (player.health <= 0) finish(false);
  updateCamera();
  updateObjective();
}
function loop(time) {
  const dt = Math.min(2, (time - state.lastTime) / 16.67 || 1);
  state.lastTime = time;
  update(dt);
  drawWorld();
  requestAnimationFrame(loop);
}
function resetGame() {
  player.x = 160;
  player.y = 560;
  player.health = 100;
  player.stamina = 100;
  player.cells = 0;
  player.scrap = 0;
  player.ammo = 12;
  state.running = true;
  state.paused = false;
  state.alert = 0;
  state.score = 0;
  beacons.forEach((beacon) => {
    beacon.activated = false;
  });
  loot.forEach((item) => {
    item.taken = false;
  });
  document.getElementById("result-panel").classList.add("hidden");
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (
    ["a", "d", "w", " ", "shift", "control", "e", "escape", "c", "f"].includes(
      key,
    )
  )
    event.preventDefault();
  keys.add(key);
  if (key === "e" && !event.repeat) interact();
  if (key === "escape" && !event.repeat) {
    state.paused = !state.paused;
    document
      .getElementById("pause-panel")
      .classList.toggle("hidden", !state.paused);
  }
});
window.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) * WIDTH) / rect.width;
  mouse.y = ((event.clientY - rect.top) * HEIGHT) / rect.height;
});
canvas.addEventListener("mousedown", () => {
  mouse.down = true;
  fire();
});
window.addEventListener("mouseup", () => {
  mouse.down = false;
});
document.getElementById("resume-button").addEventListener("click", () => {
  state.paused = false;
  document.getElementById("pause-panel").classList.add("hidden");
});
document.getElementById("retry-button").addEventListener("click", resetGame);
resetGame();
requestAnimationFrame(loop);
