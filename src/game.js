const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const world = { width: 5600, height: 900 };
const camera = { x: 0, y: 0 };
const keys = new Set();
const mouse = { x: 640, y: 360, down: false };
const state = { alert: 0, score: 0, paused: false, complete: false, last: 0 };
const images = {};
const paths = {
  player:
    "assets/pack/world/post-apocalypse-survivor/Character/Main/Character_side_idle-Sheet6.png",
  enemy:
    "assets/pack/world/post-apocalypse-survivor/Enemies/Zombie_Axe/Zombie_Axe_Side-left_Idle-Sheet6.png",
  factory: "assets/pack/tilesets/factory-cyberpunk/1 Tiles/Tileset.png",
  backdrop:
    "assets/pack/tilesets/factory-cyberpunk/2 Background/Background.png",
};
Object.entries(paths).forEach(([name, path]) => {
  const image = new Image();
  image.src = path;
  images[name] = image;
});
const player = {
  x: 140,
  y: 540,
  width: 42,
  height: 58,
  vy: 0,
  grounded: false,
  health: 100,
  ammo: 8,
  facing: 1,
  cooldown: 0,
};
const platforms = [
  { x: 0, y: 660, w: 900, h: 240 },
  { x: 1050, y: 660, w: 1060, h: 240 },
  { x: 2300, y: 660, w: 1040, h: 240 },
  { x: 3540, y: 660, w: 800, h: 240 },
  { x: 4520, y: 660, w: 1080, h: 240 },
  { x: 210, y: 500, w: 280, h: 24 },
  { x: 590, y: 400, w: 210, h: 24 },
  { x: 760, y: 300, w: 180, h: 24 },
  { x: 1150, y: 510, w: 260, h: 24 },
  { x: 1500, y: 410, w: 240, h: 24 },
  { x: 1770, y: 290, w: 230, h: 24 },
  { x: 2420, y: 500, w: 260, h: 24 },
  { x: 2750, y: 370, w: 280, h: 24 },
  { x: 3050, y: 250, w: 210, h: 24 },
  { x: 3650, y: 490, w: 260, h: 24 },
  { x: 3990, y: 360, w: 240, h: 24 },
  { x: 4620, y: 500, w: 250, h: 24 },
  { x: 4930, y: 370, w: 280, h: 24 },
  { x: 5250, y: 250, w: 220, h: 24 },
];
const doors = [
  {
    x: 900,
    y: 520,
    h: 140,
    code: "314",
    open: false,
    label: "GATE 01 / MAINTENANCE",
  },
  {
    x: 2160,
    y: 520,
    h: 140,
    code: "827",
    open: false,
    label: "GATE 02 / FLOODLINE",
  },
  {
    x: 3400,
    y: 520,
    h: 140,
    code: "509",
    open: false,
    label: "GATE 03 / CORE ACCESS",
  },
];
const terminals = [
  { x: 620, y: 590, fragment: "3", found: false, label: "TERMINAL A // 3" },
  { x: 1380, y: 590, fragment: "1", found: false, label: "TERMINAL B // 1" },
  { x: 1860, y: 590, fragment: "4", found: false, label: "TERMINAL C // 4" },
  { x: 2670, y: 590, fragment: "8", found: false, label: "TERMINAL D // 8" },
  { x: 3150, y: 590, fragment: "2", found: false, label: "TERMINAL E // 2" },
  { x: 3850, y: 590, fragment: "7", found: false, label: "TERMINAL F // 7" },
  { x: 4250, y: 590, fragment: "5", found: false, label: "TERMINAL G // 5" },
  { x: 4900, y: 590, fragment: "0", found: false, label: "TERMINAL H // 0" },
  { x: 5200, y: 590, fragment: "9", found: false, label: "TERMINAL I // 9" },
];
const drones = [
  { x: 480, y: 570, min: 300, max: 800, dir: 1, state: "patrol" },
  { x: 1280, y: 460, min: 1130, max: 1900, dir: -1, state: "patrol" },
  { x: 2600, y: 570, min: 2360, max: 3250, dir: 1, state: "patrol" },
  { x: 3820, y: 430, min: 3650, max: 4200, dir: -1, state: "patrol" },
  { x: 4900, y: 570, min: 4610, max: 5400, dir: 1, state: "patrol" },
];
const bullets = [];
const train = { x: 5200, y: 495, w: 350, h: 165 };

function ready(image) {
  return image.complete && image.naturalWidth > 0;
}
function play(soundName) {
  const sound = new Audio(soundName);
  sound.volume = 0.18;
  sound.play().catch(() => {});
}
function overlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.width > b.x &&
    a.y < b.y + b.h &&
    a.y + a.height > b.y
  );
}
function solid(rect) {
  return platforms.some((platform) =>
    overlap(rect, {
      x: platform.x,
      y: platform.y,
      w: platform.w,
      h: platform.h,
    }),
  );
}
function near(entity, distance) {
  return (
    Math.abs(player.x - entity.x) < distance &&
    Math.abs(player.y - entity.y) < 105
  );
}
function currentTarget() {
  const terminal = terminals.find((item) => !item.found && near(item, 80));
  if (terminal) return { type: "terminal", item: terminal };
  const door = doors.find((item) => !item.open && near(item, 100));
  if (door) return { type: "door", item: door };
  if (state.complete && near(train, 190))
    return { type: "extract", item: train };
  return null;
}
function showMessage(text) {
  const message = document.getElementById("message-card");
  message.textContent = text;
  message.classList.remove("hidden");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => message.classList.add("hidden"), 2500);
}
function interact() {
  const target = currentTarget();
  if (!target) return;
  if (target.type === "terminal") {
    target.item.found = true;
    state.score += 100;
    showMessage(
      `${target.item.label} // FRAGMENT ${target.item.fragment} TROUVÉ`,
    );
    updateHud();
    return;
  }
  if (target.type === "door") {
    openCodePanel(target.item);
    return;
  }
  if (target.type === "extract") finish();
}
function openCodePanel(door) {
  const panel = document.getElementById("code-panel");
  panel.dataset.code = door.code;
  panel.dataset.door = doors.indexOf(door);
  document.getElementById("code-title").textContent = door.label;
  document.getElementById("code-hint").textContent =
    "Le code se construit avec les fragments trouvés dans les terminaux.";
  document.getElementById("code-readout").textContent = door.code
    .split("")
    .map((digit, index) =>
      terminals.find(
        (terminal) => terminal.fragment === digit && terminal.found,
      )
        ? digit
        : "_",
    )
    .join(" ");
  document.getElementById("code-input").value = "";
  panel.classList.remove("hidden");
  document.getElementById("code-input").focus();
}
function submitCode() {
  const panel = document.getElementById("code-panel");
  const door = doors[Number(panel.dataset.door)];
  const input = document.getElementById("code-input").value;
  if (
    input === door.code &&
    door.code
      .split("")
      .every((digit) =>
        terminals.some(
          (terminal) => terminal.fragment === digit && terminal.found,
        ),
      )
  ) {
    door.open = true;
    state.score += 300;
    state.alert = Math.max(0, state.alert - 25);
    panel.classList.add("hidden");
    showMessage(`${door.label} // ACCÈS AUTORISÉ`);
  } else {
    state.alert = Math.min(100, state.alert + 35);
    showMessage("CODE REFUSÉ // TRACE D’INTRUSION ENREGISTRÉE");
  }
  updateHud();
}
function movePlayer(dt) {
  const left = keys.has("a");
  const right = keys.has("d");
  const speed = keys.has("shift") ? 4.4 : 2.7;
  if (left || right) {
    const direction = right ? 1 : -1;
    player.facing = direction;
    const next = {
      x: player.x + direction * speed * dt,
      y: player.y,
      w: player.width,
      h: player.height,
    };
    if (!solid(next)) player.x += direction * speed * dt;
  }
  player.vy += 0.46 * dt;
  const nextY = player.y + player.vy * dt;
  const floor = platforms.find(
    (platform) =>
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.w &&
      player.y + player.height <= platform.y + 28 &&
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
  if (
    (keys.has("w") || keys.has(" ")) &&
    player.grounded &&
    !keys.has("jumpLock")
  ) {
    player.vy = -9;
    player.grounded = false;
    keys.add("jumpLock");
  }
  if (!keys.has("w") && !keys.has(" ")) keys.delete("jumpLock");
  player.cooldown = Math.max(0, player.cooldown - dt);
  if (keys.has("f") || mouse.down) fire();
  if (player.y > 850) {
    player.x = Math.max(100, player.x - 200);
    player.y = 500;
    player.health -= 15;
  }
}
function fire() {
  if (player.cooldown > 0 || player.ammo <= 0) return;
  const angle = Math.atan2(
    mouse.y + camera.y - player.y,
    mouse.x + camera.x - player.x,
  );
  bullets.push({
    x: player.x + 24,
    y: player.y + 25,
    vx: Math.cos(angle) * 11,
    vy: Math.sin(angle) * 11,
    life: 50,
  });
  player.ammo -= 1;
  player.cooldown = 16;
  state.alert = Math.min(100, state.alert + 15);
}
function updateDrones(dt) {
  drones.forEach((drone) => {
    drone.x += drone.dir * 0.7 * dt;
    if (drone.x < drone.min || drone.x > drone.max) drone.dir *= -1;
    const visible =
      Math.abs(player.x - drone.x) < 260 && Math.abs(player.y - drone.y) < 105;
    if (visible) {
      drone.state = "alert";
      state.alert = Math.min(100, state.alert + 18 * dt);
    } else drone.state = "patrol";
    if (
      drone.state === "alert" &&
      Math.abs(player.x - drone.x) < 45 &&
      player.health > 0
    )
      player.health -= 9 * dt;
  });
  state.alert = Math.max(0, state.alert - 7 * dt);
}
function updateBullets(dt) {
  bullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    drones.forEach((drone) => {
      if (Math.hypot(bullet.x - drone.x, bullet.y - drone.y) < 28) {
        drone.state = "disabled";
        bullet.life = 0;
        state.score += 80;
      }
    });
  });
  for (let i = bullets.length - 1; i >= 0; i -= 1)
    if (bullets[i].life <= 0) bullets.splice(i, 1);
}
function updateHud() {
  const found = terminals.filter((terminal) => terminal.found).length;
  document.getElementById("objective").textContent = doors.every(
    (door) => door.open,
  )
    ? "Atteindre le train d’extraction"
    : "Trouver les fragments et ouvrir les portes";
  document.getElementById("objective-detail").textContent =
    `${found} / ${terminals.length} fragments • ${doors.filter((door) => door.open).length} / ${doors.length} portes`;
  document.getElementById("code-fragments").textContent =
    `CODE FRAGMENTS ${found}`;
  document.getElementById("access-state").textContent =
    `${doors.filter((door) => door.open).length} / ${doors.length} DOORS OPEN`;
  document.getElementById("health").textContent = Math.max(
    0,
    Math.round(player.health),
  );
  document.getElementById("health-bar").style.width =
    `${Math.max(0, player.health)}%`;
  document.getElementById("alert-level").textContent =
    `${Math.round(state.alert)}%`;
  document.getElementById("alert-bar").style.width = `${state.alert}%`;
  document.getElementById("mission-state").textContent =
    state.alert > 60
      ? "TRACE ACTIVE"
      : doors.every((door) => door.open)
        ? "EXTRACTION"
        : "LOCKDOWN";
  const target = currentTarget();
  const prompt = document.getElementById("world-prompt");
  prompt.classList.toggle("hidden", !target);
  if (target)
    prompt.textContent =
      target.type === "door"
        ? "[ E ] SAISIR LE CODE"
        : target.type === "extract"
          ? "[ E ] EXTRAIRE"
          : "[ E ] SCANNER LE TERMINAL";
}
function drawImage(name, x, y, width, height, alpha = 1) {
  if (!ready(images[name])) return false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(images[name], x, y, width, height);
  ctx.globalAlpha = 1;
  return true;
}
function drawSprite(name, x, y, width, height) {
  if (!ready(images[name])) return false;
  const image = images[name];
  const frameWidth = image.naturalWidth / 6;
  ctx.drawImage(
    image,
    0,
    0,
    frameWidth,
    image.naturalHeight,
    x,
    y,
    width,
    height,
  );
  return true;
}
function draw() {
  ctx.fillStyle = "#071015";
  ctx.fillRect(0, 0, W, H);
  if (ready(images.backdrop)) {
    ctx.globalAlpha = 0.42;
    ctx.drawImage(images.backdrop, -camera.x * 0.16, 0, world.width, H);
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.fillStyle = "rgba(5,11,15,.75)";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.strokeStyle = "rgba(97,230,212,.07)";
  for (let x = 0; x < world.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 900);
    ctx.stroke();
  }
  for (let y = 0; y < 900; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
  platforms.forEach((platform) => {
    ctx.fillStyle = "#111e24";
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = "#1c4246";
    ctx.fillRect(platform.x, platform.y, platform.w, 4);
    ctx.strokeStyle = "rgba(97,230,212,.35)";
    ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
    for (let x = platform.x + 14; x < platform.x + platform.w; x += 48) {
      ctx.fillStyle = "#162d32";
      ctx.fillRect(x, platform.y + 15, 26, 5);
    }
  });
  doors.forEach((door) => {
    ctx.fillStyle = door.open ? "rgba(97,230,212,.2)" : "#171d29";
    ctx.fillRect(door.x, door.y, 34, door.h);
    ctx.strokeStyle = door.open ? "#61e6d4" : "#ff5c91";
    ctx.lineWidth = 3;
    ctx.strokeRect(door.x, door.y, 34, door.h);
    ctx.fillStyle = door.open ? "#61e6d4" : "#ff5c91";
    ctx.fillRect(door.x - 10, door.y - 16, 54, 5);
    ctx.font = "8px Space Mono";
    ctx.fillText(
      door.open ? "OPEN" : "LOCKED",
      door.x - 15,
      door.y + door.h + 18,
    );
  });
  terminals.forEach((terminal) => {
    ctx.fillStyle = terminal.found ? "#61e6d4" : "#e6ed6b";
    ctx.fillRect(terminal.x, terminal.y, 28, 54);
    ctx.fillStyle = "#071015";
    ctx.fillRect(terminal.x + 5, terminal.y + 8, 18, 18);
    ctx.fillStyle = terminal.found ? "#61e6d4" : "#ff5c91";
    ctx.fillRect(terminal.x + 9, terminal.y + 13, 10, 3);
  });
  drones.forEach((drone) => {
    ctx.globalAlpha = drone.state === "alert" ? 0.22 : 0.08;
    ctx.fillStyle = drone.state === "alert" ? "#ff5c91" : "#e6ed6b";
    ctx.beginPath();
    ctx.arc(
      drone.x,
      drone.y,
      190,
      Math.PI * (drone.dir > 0 ? 1.3 : 0.3),
      Math.PI * (drone.dir > 0 ? 1.8 : 0.8),
    );
    ctx.lineTo(drone.x, drone.y);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (!drawSprite("enemy", drone.x - 20, drone.y - 35, 42, 50)) {
      ctx.fillStyle = drone.state === "disabled" ? "#405053" : "#ff5c91";
      ctx.fillRect(drone.x - 18, drone.y - 22, 36, 28);
    }
  });
  bullets.forEach((bullet) => {
    ctx.fillStyle = "#e6ed6b";
    ctx.fillRect(bullet.x, bullet.y, 10, 3);
  });
  if (doors.every((door) => door.open)) {
    ctx.strokeStyle = "#61e6d4";
    ctx.lineWidth = 3;
    ctx.strokeRect(train.x, train.y, train.w, train.h);
    ctx.fillStyle = "#61e6d4";
    ctx.font = "11px Space Mono";
    ctx.fillText("EXTRACTION NODE", train.x + 35, train.y + 75);
  }
  drawSprite("player", player.x, player.y, player.width, player.height) ||
    ((ctx.fillStyle = "#e6ed6b"),
    ctx.fillRect(player.x, player.y, player.width, player.height));
  ctx.restore();
}
function finish() {
  state.complete = true;
  showMessage(`EXTRACTION RÉUSSIE // SCORE ${state.score}`);
}
function update(dt) {
  if (state.paused || state.complete) return;
  movePlayer(dt);
  updateDrones(dt);
  updateBullets(dt);
  updateCamera();
  updateHud();
  if (player.health <= 0) {
    player.health = 100;
    player.x = 140;
    showMessage("SIGNAL PERDU // RETOUR AU POINT DE DÉPART");
  }
}
function updateCamera() {
  camera.x += (player.x - W * 0.32 - camera.x) * 0.12;
  camera.x = Math.max(0, Math.min(world.width - W, camera.x));
}
function loop(time) {
  const dt = Math.min(2.2, (time - state.last || 16) / 16.67);
  state.last = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["a", "d", "w", " ", "e", "f", "shift"].includes(key))
    event.preventDefault();
  keys.add(key);
  if (key === "e" && !event.repeat) interact();
  if (key === "escape" && !event.repeat) state.paused = !state.paused;
});
window.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) * W) / rect.width;
  mouse.y = ((event.clientY - rect.top) * H) / rect.height;
});
canvas.addEventListener("mousedown", () => {
  mouse.down = true;
  fire();
});
window.addEventListener("mouseup", () => {
  mouse.down = false;
});
document.getElementById("code-submit").addEventListener("click", submitCode);
document
  .getElementById("code-close")
  .addEventListener("click", () =>
    document.getElementById("code-panel").classList.add("hidden"),
  );
document.getElementById("code-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitCode();
});
requestAnimationFrame(loop);
