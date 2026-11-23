// ============ Colombia GTA — Edición Definitiva · Motor ============
let scene, camera, renderer, clock;
let playerGroup, playerCar = null;
let vehicles = [], policeCars = [], pedestrians = [], pickups = [];
let keys = {}, pointerLocked = false, uiOpen = false, mouseDown = false;
let gameState = 'loading'; // loading | menu | playing | paused
let money = 500, health = 100, armor = 0, wantedLevel = 0;
let wantedTimers = [0, 0, 0, 0, 0];
let missionsCompleted = [];
let camYaw = 0, camPitch = 0.28;
let waterMesh = null, clouds = [], muzzleFlash = null, flashT = 0;
let safehousePos = { x: -160, z: 160 }, safehouseCooldown = 0;
let menuIdx = 0, pauseIdx = 0;

// ---- Armas ----
const WEAPONS = [
    { name: 'Pistola',  icon: '🔫', dmg: 1, rate: .26, auto: false },
    { name: 'Subfusil', icon: '💥', dmg: 1, rate: .09, auto: true  },
    { name: 'Escopeta', icon: '🧨', dmg: 3, rate: .8,  auto: false }
];
let currentWeapon = 0, lastShot = -9;

// ============ Texturas ============
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function noise(ctx, w, h, alpha, n, dark) {
    for (let i = 0; i < n; i++) {
        const v = dark ? Math.random() * 45 | 0 : 140 + Math.random() * 80 | 0;
        ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
}

function roadTexture() {
    const c = makeCanvas(512, 512), x = c.getContext('2d');
    x.fillStyle = '#3a3a3e'; x.fillRect(0, 0, 512, 512);
    noise(x, 512, 512, .25, 9000, true);
    for (let i = 0; i < 14; i++) {
        x.fillStyle = `rgba(20,20,22,${.1 + Math.random() * .15})`;
        x.beginPath(); x.ellipse(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 50, 12 + Math.random() * 30, Math.random() * 3, 0, 7); x.fill();
    }
    x.strokeStyle = 'rgba(25,25,28,.6)'; x.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
        x.beginPath(); let px = Math.random() * 512, py = Math.random() * 512; x.moveTo(px, py);
        for (let s = 0; s < 6; s++) { px += (Math.random() - .5) * 70; py += (Math.random() - .5) * 70; x.lineTo(px, py); }
        x.stroke();
    }
    x.fillStyle = '#d8b74a';
    for (let y = 0; y < 512; y += 64) x.fillRect(248, y, 10, 36);
    x.fillStyle = 'rgba(235,235,235,.75)';
    x.fillRect(28, 0, 7, 512); x.fillRect(477, 0, 7, 512);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

function sidewalkTexture() {
    const c = makeCanvas(256, 256), x = c.getContext('2d');
    x.fillStyle = '#9a9691'; x.fillRect(0, 0, 256, 256);
    noise(x, 256, 256, .18, 4000, false);
    x.strokeStyle = 'rgba(70,68,65,.7)'; x.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
        x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 256); x.stroke();
        x.beginPath(); x.moveTo(0, i * 64); x.lineTo(256, i * 64); x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

function facadeTexture(base, floorH, cols, opts = {}) {
    const W = 256, H = 256;
    const c = makeCanvas(W, H), x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, W, H);
    noise(x, W, H, .1, 2500, false);
    const floors = Math.max(2, Math.round(H / floorH));
    const cw = W / cols;
    for (let f = 0; f < floors; f++) {
        const fy = f * (H / floors);
        x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, fy + H / floors - 4, W, 4);
        for (let col = 0; col < cols; col++) {
            const wx = col * cw + cw * .18, ww = cw * .64;
            const wy = fy + H / floors * .18, wh = H / floors * .55;
            x.fillStyle = opts.frame || 'rgba(245,245,245,.9)';
            x.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
            const lit = Math.random() < (opts.litChance ?? .35);
            if (lit) {
                const g = x.createLinearGradient(wx, wy, wx, wy + wh);
                g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#f5c542');
                x.fillStyle = g;
            } else x.fillStyle = Math.random() < .5 ? '#1e2f3d' : '#24384a';
            x.fillRect(wx, wy, ww, wh);
            x.fillStyle = 'rgba(255,255,255,.16)';
            x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + ww * .45, wy); x.lineTo(wx, wy + wh * .55); x.closePath(); x.fill();
            x.fillStyle = 'rgba(255,255,255,.75)';
            x.fillRect(wx + ww / 2 - 1, wy, 2, wh);
        }
        // balcón cada 2 pisos
        if (opts.balcony && f > 0 && f % 2 === 0) {
            x.fillStyle = 'rgba(60,50,45,.9)';
            x.fillRect(8, fy + H / floors - 8, W - 16, 5);
        }
    }
    if (opts.storefront) {
        const gy = H - 46;
        x.fillStyle = opts.storeColor || '#263238'; x.fillRect(0, gy, W, 46);
        x.fillStyle = 'rgba(0,0,0,.35)';
        for (let y = gy + 4; y < H; y += 7) x.fillRect(0, y, W, 3);
        x.fillStyle = opts.sign || '#c62828'; x.fillRect(0, gy - 16, W, 16);
        x.fillStyle = '#fff'; x.font = 'bold 11px Arial'; x.textAlign = 'center';
        x.fillText(opts.shop || 'TIENDA', W / 2, gy - 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
}

function grassTexture() {
    const c = makeCanvas(256, 256), x = c.getContext('2d');
    x.fillStyle = '#4e7a3a'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 7000; i++) {
        x.fillStyle = `rgba(${40 + Math.random() * 50 | 0},${90 + Math.random() * 70 | 0},${30 + Math.random() * 40 | 0},.5)`;
        x.fillRect(Math.random() * 256, Math.random() * 256, 2, 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

function sandTexture() {
    const c = makeCanvas(256, 256), x = c.getContext('2d');
    x.fillStyle = '#e8d5a8'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
        const v = 190 + Math.random() * 55 | 0;
        x.fillStyle = `rgba(${v},${v - 25},${v - 70},.55)`;
        x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    x.fillStyle = 'rgba(160,140,100,.3)';
    for (let i = 0; i < 24; i++) { x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 9, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

function skyTexture() {
    const c = makeCanvas(64, 512), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#140c3a'); g.addColorStop(.35, '#4a2a6b');
    g.addColorStop(.62, '#c45a78'); g.addColorStop(.8, '#f0975a');
    g.addColorStop(1, '#ffd89a');
    x.fillStyle = g; x.fillRect(0, 0, 64, 512);
    return new THREE.CanvasTexture(c);
}

function sunTexture() {
    const c = makeCanvas(128, 128), x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,230,1)');
    g.addColorStop(.25, 'rgba(255,235,170,.95)');
    g.addColorStop(.55, 'rgba(255,190,110,.45)');
    g.addColorStop(1, 'rgba(255,160,80,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}

function cloudTexture() {
    const c = makeCanvas(256, 128), x = c.getContext('2d');
    x.clearRect(0, 0, 256, 128);
    for (let i = 0; i < 16; i++) {
        const px = 40 + Math.random() * 176, py = 45 + Math.random() * 45, r = 16 + Math.random() * 30;
        const g = x.createRadialGradient(px, py, 2, px, py, r);
        g.addColorStop(0, 'rgba(255,235,225,.9)');
        g.addColorStop(1, 'rgba(255,215,200,0)');
        x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    }
    return new THREE.CanvasTexture(c);
}

function textTexture(text, bg, fg, w = 256, h = 64, font = 'bold 34px Arial') {
    const c = makeCanvas(w, h), x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, w / 2, h / 2 + 2);
    const t = new THREE.CanvasTexture(c);
    return t;
}

// ============ Audio sintetizado (sin archivos) ============
const AudioSys = {
    ctx: null, engOsc: null, engGain: null, sirOsc: null, sirGain: null,
    init() {
        if (this.ctx) { this.resume(); return; }
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            const c = this.ctx;
            // motor
            this.engOsc = c.createOscillator(); this.engOsc.type = 'sawtooth'; this.engOsc.frequency.value = 55;
            this.engGain = c.createGain(); this.engGain.gain.value = 0;
            const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
            this.engOsc.connect(lp); lp.connect(this.engGain); this.engGain.connect(c.destination);
            this.engOsc.start();
            // sirena
            this.sirOsc = c.createOscillator(); this.sirOsc.type = 'square'; this.sirOsc.frequency.value = 720;
            this.sirGain = c.createGain(); this.sirGain.gain.value = 0;
            this.sirOsc.connect(this.sirGain); this.sirGain.connect(c.destination);
            this.sirOsc.start();
            // buffer de ruido para disparos
            const len = c.sampleRate * .2;
            this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
            const d = this.noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        } catch (e) { /* sin audio */ }
    },
    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
    shot() {
        if (!this.ctx) return;
        const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noiseBuf;
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400 + Math.random() * 600; bp.Q.value = .8;
        const g = c.createGain(); g.gain.setValueAtTime(.5, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .16);
        s.connect(bp); bp.connect(g); g.connect(c.destination); s.start();
    },
    beep(f, dur = .12, type = 'sine', vol = .16, f2) {
        if (!this.ctx) return;
        const c = this.ctx, o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f, c.currentTime);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
        g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dur);
        o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur + .02);
    },
    pickup() { this.beep(760, .1, 'sine', .18, 1420); },
    complete() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, .18, 'triangle', .16), i * 110)); },
    save() { [660, 880].forEach((f, i) => setTimeout(() => this.beep(f, .15, 'sine', .14), i * 120)); },
    engine(speed) {
        if (!this.engGain) return;
        const on = speed > .4;
        this.engGain.gain.value = on ? .05 : 0;
        if (on) this.engOsc.frequency.value = 48 + Math.abs(speed) * 9;
    },
    siren(on) { if (this.sirGain) this.sirGain.gain.value = on ? .028 : 0; },
    update(t) {
        if (this.sirGain && this.sirGain.gain.value > 0)
            this.sirOsc.frequency.value = (t % .8 < .4) ? 760 : 560;
    }
};

// ============ Inicialización ============
function initGame() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = skyTexture();
    scene.fog = new THREE.Fog(0xe8a06a, 110, 420);

    camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .1, 900);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Sol de atardecer
    const sunSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTexture(), transparent: true, fog: false, depthWrite: false }));
    sunSpr.scale.set(90, 90, 1);
    sunSpr.position.set(170, 105, 90);
    scene.add(sunSpr);

    // Nube
    const cloudTex = cloudTexture();
    for (let i = 0; i < 12; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: .55 + Math.random() * .3, fog: false, depthWrite: false }));
        const s = 60 + Math.random() * 90;
        sp.scale.set(s, s * .5, 1);
        sp.position.set((Math.random() - .5) * 700, 95 + Math.random() * 70, (Math.random() - .5) * 700);
        sp.userData.spd = .8 + Math.random() * 1.6;
        scene.add(sp); clouds.push(sp);
    }

    // Iluminación
    scene.add(new THREE.HemisphereLight(0xffc9a0, 0x3a3a55, .8));
    const sun = new THREE.DirectionalLight(0xffd0a0, 1.4);
    sun.position.set(70, 90, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    const d = 140;
    sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
    sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
    sun.shadow.camera.far = 380; sun.shadow.bias = -0.0004;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x8a7aff, .35); fill.position.set(-60, 40, -50); scene.add(fill);

    // Flash del arma
    const flashTex = sunTexture();
    muzzleFlash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color: 0xffdd88, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    muzzleFlash.scale.set(.5, .5, 1);
    muzzleFlash.position.set(.35, -.15, -1.4);
    muzzleFlash.visible = false;
    camera.add(muzzleFlash);

    initCity();
    initPlayer();
    initVehicles();
    initPedestrians();
    initPickups();

    addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
    });

    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', e => { keys[codeOf(e)] = false; });
    addEventListener('mousemove', e => { if (pointerLocked && gameState === 'playing') { camYaw -= e.movementX * .0023; camPitch = Math.max(-.2, Math.min(.85, camPitch + e.movementY * .0018)); } });
    addEventListener('mousedown', e => { if (e.button === 0 && gameState === 'playing' && pointerLocked) { mouseDown = true; tryShoot(); } });
    addEventListener('mouseup', () => mouseDown = false);
    document.addEventListener('pointerlockchange', () => {
        pointerLocked = !!document.pointerLockElement;
        if (!pointerLocked && gameState === 'playing' && !uiOpen) showPause();
    });
    renderer.domElement.addEventListener('click', () => { if (gameState === 'playing' && !pointerLocked && !uiOpen) safePointerLock(); });

    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('menu').style.display = 'flex';
        gameState = 'menu';
    }, 2300);
}

// ---- Entrada (WASD + FLECHAS) ----
const KEYMAP = { ArrowUp: 'KeyW', ArrowDown: 'KeyS', ArrowLeft: 'KeyA', ArrowRight: 'KeyD' };
function codeOf(e) { return KEYMAP[e.code] || e.code; }

function onKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();

    if (e.code === 'Escape') {
        if (gameState === 'playing') showPause();
        else if (gameState === 'paused') resumeGame();
        return;
    }
    if (gameState === 'menu') return menuNav(e);
    if (gameState === 'paused') return pauseNav(e);

    keys[codeOf(e)] = true;
    if (e.repeat) return;
    if (e.code === 'KeyE') tryEnterVehicle();
    if (e.code === 'KeyM') toggleMissions();
    if (e.code === 'Digit1') selectWeapon(0);
    if (e.code === 'Digit2') selectWeapon(1);
    if (e.code === 'Digit3') selectWeapon(2);
}

function menuNav(e) {
    const btns = [...document.querySelectorAll('.menu-buttons button')];
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { menuIdx = (menuIdx + 1) % btns.length; e.preventDefault(); }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') { menuIdx = (menuIdx + btns.length - 1) % btns.length; e.preventDefault(); }
    else if (e.code === 'Enter' || e.code === 'Space') { btns[menuIdx].click(); return; }
    else return;
    btns.forEach((b, i) => b.classList.toggle('sel', i === menuIdx));
}

function pauseNav(e) {
    const btns = [...document.querySelectorAll('.pause-box button')];
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { pauseIdx = (pauseIdx + 1) % btns.length; e.preventDefault(); }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') { pauseIdx = (pauseIdx + btns.length - 1) % btns.length; e.preventDefault(); }
    else if (e.code === 'Enter' || e.code === 'Space') { btns[pauseIdx].click(); return; }
    else return;
    btns.forEach((b, i) => b.classList.toggle('sel', i === pauseIdx));
}

// ---- Juego ----
function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    gameState = 'playing';
    uiOpen = false;
    AudioSys.init(); AudioSys.resume();
    safePointerLock();
    const saved = JSON.parse(localStorage.getItem('cgta_save') || 'null');
    if (saved) { money = saved.money ?? 500; health = saved.health ?? 100; armor = saved.armor ?? 0; missionsCompleted = saved.done || []; }
    const next = missions.findIndex(m => !missionsCompleted.includes(m.id));
    if (next >= 0) startMission(next);
    updateHUD();
}

function showPause() {
    if (gameState !== 'playing') return;
    gameState = 'paused'; uiOpen = true; pauseIdx = 0;
    document.getElementById('pause').style.display = 'flex';
    document.querySelectorAll('.pause-box button').forEach((b, i) => b.classList.toggle('sel', i === 0));
    document.exitPointerLock();
    AudioSys.engine(0);
}
function resumeGame() {
    document.getElementById('pause').style.display = 'none';
    uiOpen = false; gameState = 'playing';
    safePointerLock();
}
function quitToMenu() {
    document.getElementById('pause').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('menu').style.display = 'flex';
    gameState = 'menu'; uiOpen = false;
    document.exitPointerLock();
}

function saveGame() {
    localStorage.setItem('cgta_save', JSON.stringify({ money, health, armor, done: missionsCompleted }));
}

function safePointerLock() {
    try { const p = renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignorar */ }
}

// ---- Búsqueda policial ----
function raiseWanted(n = 1) {
    for (let k = 0; k < n; k++)
        for (let i = 0; i < 5; i++)
            if (wantedTimers[i] <= 0) { wantedTimers[i] = 18; break; }
}
function updateWanted(dt) {
    let count = 0;
    for (let i = 0; i < 5; i++) {
        if (wantedTimers[i] > 0) {
            wantedTimers[i] -= dt;
            if (wantedTimers[i] <= 0) wantedTimers[i] = 0;
            else count++;
        }
    }
    wantedLevel = count;
    AudioSys.siren(count > 0);
}

// ---- Casa franca ----
function checkSafehouse() {
    if (safehouseCooldown > 0) { safehouseCooldown -= 1 / 60; return; }
    const p = playerCar ? playerCar.position : playerGroup.position;
    if (Math.hypot(p.x - safehousePos.x, p.z - safehousePos.z) < 5) {
        safehouseCooldown = 30;
        health = 100; armor = 100;
        saveGame(); AudioSys.save();
        showToast('🏠 <b>Casa franca</b><br>Partida guardada · Vida y chaleco restaurados');
    }
}

function showToast(html, color = '#4dd0e1') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderColor = color;
    t.innerHTML = html;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

// ---- Cámara ----
function updateCamera(dt) {
    const tgt = playerCar ? playerCar.position : playerGroup.position;
    const type = playerCar ? playerCar.userData.type : null;
    const dist = type === 'plane' ? 18 : type === 'tank' ? 12 : playerCar ? 10.5 : 7;
    const h = type === 'plane' ? 7 : playerCar ? 4.2 : 3.1;
    const cx = tgt.x + Math.sin(camYaw) * dist;
    const cz = tgt.z + Math.cos(camYaw) * dist;
    camera.position.lerp(new THREE.Vector3(cx, tgt.y + h + camPitch * 4, cz), 1 - Math.pow(.001, dt));
    camera.lookAt(tgt.x, tgt.y + (type === 'plane' ? 2 : 1.7), tgt.z);
}

// ---- Radar ----
function drawRadar() {
    const cv = document.getElementById('radar-canvas'), x = cv.getContext('2d');
    const S = 170, R = S / 2, scale = .34;
    const px = playerGroup.position.x, pz = playerGroup.position.z;
    x.save();
    x.beginPath(); x.arc(R, R, R - 3, 0, 7); x.clip();
    // agua
    const waterScreen = (300 - px) * scale + R;
    if (waterScreen < S) { x.fillStyle = '#17607d'; x.fillRect(waterScreen, 0, S - waterScreen, S); }
    x.fillStyle = '#263238'; x.fillRect(0, 0, Math.min(waterScreen, S), S);

    x.save();
    x.translate(R, R); x.rotate(-camYaw + Math.PI);
    x.strokeStyle = '#546e7a'; x.lineWidth = 7;
    for (let i = -2; i <= 2; i++) {
        const off = i * 90 - (px % 90) * scale;
        x.beginPath(); x.moveTo(off, -R * 2); x.lineTo(off, R * 2); x.stroke();
        const offz = i * 90 - (pz % 90) * scale;
        x.beginPath(); x.moveTo(-R * 2, offz); x.lineTo(R * 2, offz); x.stroke();
    }
    x.fillStyle = '#37474f';
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        const bx = i * 90 + 45 - (px % 90) * scale, bz = j * 90 + 45 - (pz % 90) * scale;
        x.fillRect(bx - 26, bz - 26, 52, 52);
    }
    // vehículos
    x.fillStyle = '#6bcb77';
    vehicles.forEach(v => {
        if (v === playerCar) return;
        const vx = (v.position.x - px) * scale, vz = (v.position.z - pz) * scale;
        x.fillRect(vx - 2, vz - 2, 4, 4);
    });
    // policía (rojo)
    x.fillStyle = '#ff5252';
    policeCars.forEach(v => {
        const vx = (v.position.x - px) * scale, vz = (v.position.z - pz) * scale;
        x.fillRect(vx - 3, vz - 3, 6, 6);
    });
    // casa franca (cian)
    x.fillStyle = '#4dd0e1';
    { const hx = (safehousePos.x - px) * scale, hz = (safehousePos.z - pz) * scale;
      x.beginPath(); x.arc(hx, hz, 4, 0, 7); x.fill(); x.strokeStyle = '#000'; x.lineWidth = 1; x.stroke(); }
    // misión (amarillo)
    if (currentMission) {
        const pt = currentMission.pts[currentMission.stage];
        const mx = (pt.x - px) * scale, mz = (pt.z - pz) * scale;
        const dd = Math.hypot(mx, mz), cl = Math.min(dd, R - 14);
        const ux = dd ? mx / dd : 0, uz = dd ? mz / dd : 0;
        x.fillStyle = '#ffd93d';
        x.beginPath(); x.arc(ux * cl, uz * cl, 5, 0, 7); x.fill();
        x.strokeStyle = '#000'; x.lineWidth = 1.5; x.stroke();
    }
    x.restore();
    x.restore();
}

// ---- HUD ----
function updateHUD() {
    document.getElementById('health-num').textContent = Math.ceil(health);
    document.getElementById('armor-fill').style.width = armor + '%';
    document.getElementById('money').textContent = '$' + money.toLocaleString();
    document.querySelectorAll('#stars-row .star').forEach((s, i) => s.classList.toggle('on', wantedTimers[i] > 0));

    const w = WEAPONS[currentWeapon];
    document.getElementById('wep-icon').textContent = w.icon;
    document.getElementById('wep-name').textContent = w.name;
    document.getElementById('wep-ammo').textContent = '∞';

    const box = document.getElementById('mission-box');
    if (currentMission && gameState === 'playing') {
        box.style.display = 'block';
        document.getElementById('mission-name').textContent = currentMission.title;
        document.getElementById('mission-goal').textContent = currentMission.goal;
    } else box.style.display = 'none';

    // velocímetro
    const sp = document.getElementById('speedo');
    if (playerCar) {
        sp.style.display = 'block';
        document.getElementById('speed-num').textContent = Math.round(Math.abs(playerCar.userData.speed || 0) * 6);
    } else sp.style.display = 'none';
}

// ---- Misiones panel ----
function toggleMissions() {
    const p = document.getElementById('mission-panel');
    const open = p.style.display === 'none' || p.style.display === '';
    if (open) { p.style.display = 'flex'; uiOpen = true; document.exitPointerLock(); renderMissionList(); }
    else closeMissions();
}
function closeMissions() {
    document.getElementById('mission-panel').style.display = 'none';
    uiOpen = false;
    if (gameState === 'playing') safePointerLock();
}
function renderMissionList() {
    const list = document.getElementById('missions-list');
    list.innerHTML = '';
    missions.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'mission-item' + (i === currentMissionIndex ? ' active' : '') + (missionsCompleted.includes(m.id) ? ' done' : '');
        div.innerHTML = `<h3>${m.id}. ${m.title}</h3><p>${m.desc}</p>`;
        div.onclick = () => { startMission(i); closeMissions(); };
        list.appendChild(div);
    });
}

// ---- Efectos de mundo ----
function updateWater(t) {
    if (!waterMesh) return;
    const p = waterMesh.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i);
        p.setZ(i, Math.sin(x * .1 + t * 1.4) * .55 + Math.cos(y * .13 + t * 1.1) * .4);
    }
    p.needsUpdate = true;
    waterMesh.geometry.computeVertexNormals();
}
function updateClouds(dt) {
    clouds.forEach(c => {
        c.position.x += c.userData.spd * dt;
        if (c.position.x > 420) c.position.x = -420;
    });
}

// ============ Bucle principal ============
function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), .05);
    const t = clock.elapsedTime;

    if (gameState === 'playing') {
        updatePlayer(dt);
        updateVehicles(dt);
        updatePolice(dt);
        updatePedestrians(dt);
        updatePickups(dt);
        updateParticles(dt);
        updateWanted(dt);
        checkSafehouse();
        if (mouseDown && WEAPONS[currentWeapon].auto) tryShoot();
        updateCamera(dt);
        drawRadar();
        updateHUD();
        checkMission(dt);
        AudioSys.update(t);
        AudioSys.engine(playerCar ? Math.abs(playerCar.userData.speed || 0) : 0);
        if (flashT > 0) { flashT -= dt; if (flashT <= 0) muzzleFlash.visible = false; }
    } else if (gameState === 'menu') {
        camYaw += dt * .05;
        camera.position.set(Math.sin(camYaw) * 175, 62, Math.cos(camYaw) * 175);
        camera.lookAt(0, 8, 0);
        updateVehicles(dt);
        updatePedestrians(dt);
    } else if (gameState === 'paused') {
        AudioSys.engine(0);
    }

    updateWater(t);
    updateClouds(dt);
    renderer.render(scene, camera);
}

window.onload = () => { initGame(); animate(); };