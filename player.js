// ============ Jugador · Armas · Vehículos · Policía · Peatones ============
// (playerGroup, playerCar, vehicles, policeCars, pedestrians, pickups se declaran en game.js)

let boatList = [], planeList = [], tankList = [];
let bullets = [], particles = [];
let shootCooldown = 0;

// ---------- Texturas ----------
function shirtTexture() {
    const c = makeCanvas(128, 128), x = c.getContext('2d');
    x.fillStyle = '#2e7d32'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 26; i++) {
        const px = Math.random() * 128, py = Math.random() * 128, r = 3 + Math.random() * 5;
        x.fillStyle = ['#ffeb3b', '#ff8f00', '#f48fb1', '#81d4fa'][Math.floor(Math.random() * 4)];
        x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
        x.fillStyle = 'rgba(255,255,255,.6)';
        x.beginPath(); x.arc(px, py, r * .35, 0, 7); x.fill();
    }
    return new THREE.CanvasTexture(c);
}

function carPaint(color, police = false) {
    const c = makeCanvas(256, 128), x = c.getContext('2d');
    x.fillStyle = color; x.fillRect(0, 0, 256, 128);
    const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.4, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    if (police) {
        x.fillStyle = '#fff'; x.fillRect(0, 52, 256, 30);
        x.fillStyle = '#1b5e20'; x.font = 'bold 22px Arial'; x.textAlign = 'center';
        x.fillText('POLICÍA', 128, 75);
    }
    return new THREE.CanvasTexture(c);
}

// ============ JUGADOR ============
function initPlayer() {
    playerGroup = new THREE.Group();

    const skin = new THREE.MeshLambertMaterial({ color: 0xd9a066 });
    const jeans = new THREE.MeshLambertMaterial({ color: 0x253858 });
    const shirt = new THREE.MeshLambertMaterial({ map: shirtTexture() });

    const legL = new THREE.Mesh(new THREE.BoxGeometry(.34, .85, .34), jeans);
    legL.position.set(-.18, .42, 0); legL.castShadow = true; playerGroup.add(legL);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(.34, .85, .34), jeans);
    legR.position.set(.18, .42, 0); legR.castShadow = true; playerGroup.add(legR);
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(.36, .16, .5), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
    shoeL.position.set(-.18, .08, .05); playerGroup.add(shoeL);
    const shoeR = shoeL.clone(); shoeR.position.x = .18; playerGroup.add(shoeR);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(.78, .85, .42), shirt);
    torso.position.y = 1.28; torso.castShadow = true; playerGroup.add(torso);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(.22, .14, .22), skin);
    neck.position.y = 1.76; playerGroup.add(neck);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(.24, .75, .24), skin);
    armL.position.set(-.53, 1.28, 0); armL.castShadow = true; playerGroup.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(.24, .75, .24), skin);
    armR.position.set(.53, 1.28, 0); armR.castShadow = true; playerGroup.add(armR);

    const head = new THREE.Mesh(new THREE.BoxGeometry(.46, .5, .44), skin);
    head.position.y = 2.05; head.castShadow = true; playerGroup.add(head);
    const hair = new THREE.Mesh(new THREE.BoxGeometry(.48, .18, .46), new THREE.MeshLambertMaterial({ color: 0x2c1a0e }));
    hair.position.y = 2.36; playerGroup.add(hair);
    const beard = new THREE.Mesh(new THREE.BoxGeometry(.4, .14, .42), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
    beard.position.set(0, 1.87, .02); playerGroup.add(beard);

    // arma en la mano (cambia según el arma)
    const gun = makeGunMesh(0);
    gun.position.set(.53, 1.1, .3);
    gun.visible = false;
    playerGroup.add(gun);

    playerGroup.userData = { legL, legR, armL, armR, gun };
    playerGroup.position.set(0, .3, 30);
    scene.add(playerGroup);
}

function makeGunMesh(type) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x2b2b2b });
    if (type === 0) { // pistola
        const barrel = new THREE.Mesh(new THREE.BoxGeometry(.1, .12, .55), mat); g.add(barrel);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(.1, .3, .14), mat); grip.position.set(0, -.18, .16); g.add(grip);
    } else if (type === 1) { // subfusil
        const barrel = new THREE.Mesh(new THREE.BoxGeometry(.12, .13, .85), mat); g.add(barrel);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(.1, .36, .14), mat); mag.position.set(0, -.24, .05); g.add(mag);
        const stock = new THREE.Mesh(new THREE.BoxGeometry(.1, .16, .3), mat); stock.position.set(0, -.05, -.5); g.add(stock);
    } else { // escopeta
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .95, 8), mat); barrel.rotation.x = Math.PI / 2; g.add(barrel);
        const pump = new THREE.Mesh(new THREE.BoxGeometry(.14, .14, .3), new THREE.MeshLambertMaterial({ color: 0x6d4c41 })); pump.position.set(0, -.08, .1); g.add(pump);
        const stock = new THREE.Mesh(new THREE.BoxGeometry(.1, .2, .35), new THREE.MeshLambertMaterial({ color: 0x6d4c41 })); stock.position.set(0, -.1, -.55); g.add(stock);
    }
    return g;
}

function selectWeapon(i) {
    if (i < 0 || i >= WEAPONS.length) return;
    currentWeapon = i;
    const ud = playerGroup.userData;
    if (ud.gun) {
        playerGroup.remove(ud.gun);
        ud.gun = makeGunMesh(i);
        ud.gun.position.set(.53, 1.1, .3);
        ud.gun.visible = !playerCar;
        playerGroup.add(ud.gun);
    }
    AudioSys.beep(440 + i * 160, .08, 'square', .1);
    updateHUD();
}

function updatePlayer(dt) {
    if (playerCar) return;
    const ud = playerGroup.userData;
    const run = keys['ShiftLeft'] || keys['ShiftRight'];
    const speed = run ? 9 : 5;
    let mx = 0, mz = 0;
    if (keys['KeyW']) mz -= 1;
    if (keys['KeyS']) mz += 1;
    if (keys['KeyA']) mx -= 1;
    if (keys['KeyD']) mx += 1;

    const moving = mx || mz;
    if (moving) {
        const len = Math.hypot(mx, mz); mx /= len; mz /= len;
        const sin = Math.sin(camYaw), cos = Math.cos(camYaw);
        const wx = mx * cos - mz * sin;
        const wz = mx * sin + mz * cos;
        playerGroup.position.x += wx * speed * dt;
        playerGroup.position.z += wz * speed * dt;
        const targetRot = Math.atan2(wx, wz) + Math.PI;
        let diff = targetRot - playerGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        playerGroup.rotation.y += diff * Math.min(1, dt * 12);
    }

    if (keys['Space'] && playerGroup.position.y <= .31) ud.vy = 6.5;
    if (ud.vy !== undefined) {
        playerGroup.position.y += ud.vy * dt;
        ud.vy -= 18 * dt;
        if (playerGroup.position.y < .3) { playerGroup.position.y = .3; ud.vy = 0; }
    }

    const t = clock.elapsedTime;
    const sw = moving ? Math.sin(t * (run ? 13 : 9)) * .55 : 0;
    ud.legL.rotation.x = sw; ud.legR.rotation.x = -sw;
    ud.armL.rotation.x = -sw * .75; ud.armR.rotation.x = moving ? sw * .75 : -.35;

    const L = HALF - 2;
    playerGroup.position.x = Math.max(-L, Math.min(L, playerGroup.position.x));
    playerGroup.position.z = Math.max(-L, Math.min(L, playerGroup.position.z));
    playerGroup.position.y = Math.max(.3, playerGroup.position.y);

    if (shootCooldown > 0) shootCooldown -= dt;
}

// ============ DISPAROS ============
function tryShoot() {
    if (gameState !== 'playing' || playerCar || shootCooldown > 0) return;
    const w = WEAPONS[currentWeapon];
    shootCooldown = w.rate;
    AudioSys.shot();

    // destello
    muzzleFlash.visible = true;
    muzzleFlash.material.rotation = Math.random() * 6;
    flashT = .06;

    // dirección de la mira (desde la cámara)
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const origin = camera.position.clone();

    // raycast contra peatones, vehículos y policía
    let hitPed = null, hitVeh = null, hitDist = Infinity;
    const targets = [...pedestrians, ...vehicles, ...policeCars, ...planeList, ...boatList, ...tankList];
    targets.forEach(obj => {
        if (obj === playerCar || !obj.visible) return;
        const box = new THREE.Box3().setFromObject(obj);
        const hit = rayBox(origin, dir, box);
        if (hit !== null && hit < hitDist && hit < 120) {
            hitDist = hit; hitPed = obj;
        }
    });

    // impacto
    const impact = origin.clone().addScaledVector(dir, hitPed ? hitDist : 60);
    spawnImpact(impact);

    if (hitPed) {
        const isVeh = vehicles.includes(hitPed) || policeCars.includes(hitPed);
        if (isVeh) {
            hitPed.userData.hp = (hitPed.userData.hp ?? 3) - w.dmg;
            if (hitPed.userData.hp <= 0 && !hitPed.userData.exploded) explodeVehicle(hitPed);
        } else {
            hitPed.userData.hp = (hitPed.userData.hp ?? 2) - w.dmg;
            hitPed.userData.hurt = .3;
            if (hitPed.userData.hp <= 0) {
                hitPed.userData.dead = true;
                hitPed.rotation.x = Math.PI / 2;
                hitPed.position.y = .4;
                raiseWanted(1);
                money += 50;
            }
        }
        if (policeCars.includes(hitPed)) raiseWanted(1);
        else if (vehicles.includes(hitPed)) raiseWanted(1);
        else raiseWanted(1);
    }
}

function rayBox(origin, dir, box) {
    // AABB simple: slab method
    let tmin = -Infinity, tmax = Infinity;
    for (let a = 0; a < 3; a++) {
        const o = a === 0 ? origin.x : a === 1 ? origin.y : origin.z;
        const d = a === 0 ? dir.x : a === 1 ? dir.y : dir.z;
        const mn = box.min.getComponent(a), mx = box.max.getComponent(a);
        if (Math.abs(d) < 1e-8) {
            if (o < mn || o > mx) return null;
        } else {
            let t1 = (mn - o) / d, t2 = (mx - o) / d;
            if (t1 > t2) { const s = t1; t1 = t2; t2 = s; }
            tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
            if (tmin > tmax) return null;
        }
    }
    return tmin > 0 ? tmin : (tmax > 0 ? 0 : null);
}

function spawnImpact(pos) {
    for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(.06 + Math.random() * .08, 4, 4),
            new THREE.MeshBasicMaterial({ color: Math.random() > .5 ? 0xffcc66 : 0xff8844 })
        );
        p.position.copy(pos);
        p.userData.v = new THREE.Vector3((Math.random() - .5) * 5, Math.random() * 4, (Math.random() - .5) * 5);
        p.userData.life = .4;
        scene.add(p); particles.push(p);
    }
}

function explodeVehicle(car) {
    car.userData.exploded = true;
    AudioSys.beep(70, .5, 'sawtooth', .4, 30);
    // bola de fuego
    for (let i = 0; i < 22; i++) {
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(.3 + Math.random() * .7, 5, 5),
            new THREE.MeshBasicMaterial({ color: [0xff6600, 0xffcc00, 0xff3300][i % 3], transparent: true })
        );
        p.position.copy(car.position); p.position.y += 1;
        p.userData.v = new THREE.Vector3((Math.random() - .5) * 12, Math.random() * 9, (Math.random() - .5) * 12);
        p.userData.life = 1 + Math.random() * .6;
        scene.add(p); particles.push(p);
    }
    car.visible = false;
    // daño alrededor
    const px = playerCar ? playerCar.position.x : playerGroup.position.x;
    const pz = playerCar ? playerCar.position.z : playerGroup.position.z;
    if (Math.hypot(px - car.position.x, pz - car.position.z) < 9) health = Math.max(0, health - 30);
    raiseWanted(2);
    showToast('💥 <b>¡Vehículo destruido!</b>', '#ff6b9d');
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.userData.life -= dt;
        if (p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); continue; }
        p.position.addScaledVector(p.userData.v, dt);
        p.userData.v.y -= 9 * dt;
        p.material.opacity = Math.min(1, p.userData.life * 2);
        p.scale.multiplyScalar(1 + dt * 1.5);
    }
}

// ============ VEHÍCULOS ============
function makeCar(color, police = false) {
    const g = new THREE.Group();
    const paint = carPaint(color, police);
    const bodyMat = new THREE.MeshLambertMaterial({ map: paint });
    const glass = new THREE.MeshLambertMaterial({ color: 0x9fd8ef, transparent: true, opacity: .75 });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, .55, 4.6), bodyMat);
    chassis.position.y = .55; chassis.castShadow = true; g.add(chassis);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.0, .3, 1.3), bodyMat);
    hood.position.set(0, .9, 1.55); hood.castShadow = true; g.add(hood);
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.0, .32, 1.1), bodyMat);
    trunk.position.set(0, .9, -1.7); trunk.castShadow = true; g.add(trunk);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.85, .78, 2.1), bodyMat);
    cabin.position.set(0, 1.28, -.1); cabin.castShadow = true; g.add(cabin);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, .6, .08), glass);
    windshield.position.set(0, 1.25, .98); windshield.rotation.x = .38; g.add(windshield);
    const rearWin = windshield.clone(); rearWin.position.z = -1.16; rearWin.rotation.x = -.38; g.add(rearWin);
    [-.94, .94].forEach(sx => {
        const side = new THREE.Mesh(new THREE.BoxGeometry(.07, .55, 1.9), glass);
        side.position.set(sx, 1.28, -.1); g.add(side);
    });

    const tire = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const rim = new THREE.MeshLambertMaterial({ color: 0xb0b0b0 });
    [[-1.02, 1.5], [1.02, 1.5], [-1.02, -1.5], [1.02, -1.5]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .3, 14), tire);
        w.rotation.z = Math.PI / 2; w.position.set(wx, .42, wz); w.castShadow = true; g.add(w);
        const r = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .32, 10), rim);
        r.rotation.z = Math.PI / 2; r.position.set(wx, .42, wz); g.add(r);
    });

    const hl = new THREE.MeshBasicMaterial({ color: 0xfff8dc });
    const tl = new THREE.MeshBasicMaterial({ color: 0xff2222 });
    [-.68, .68].forEach(sx => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(.4, .2, .08), hl);
        f.position.set(sx, .78, 2.32); g.add(f);
        const r = new THREE.Mesh(new THREE.BoxGeometry(.4, .18, .08), tl);
        r.position.set(sx, .8, -2.32); g.add(r);
    });

    if (police) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, .16, .3), new THREE.MeshLambertMaterial({ color: 0x222222 }));
        bar.position.set(0, 1.76, -.1); g.add(bar);
        const red = new THREE.Mesh(new THREE.BoxGeometry(.45, .14, .28), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
        red.position.set(-.28, 1.78, -.1); g.add(red);
        const blue = new THREE.Mesh(new THREE.BoxGeometry(.45, .14, .28), new THREE.MeshBasicMaterial({ color: 0x2979ff }));
        blue.position.set(.28, 1.78, -.1); g.add(blue);
        g.userData.beacon = [red, blue];
    }

    g.userData.type = 'car';
    g.userData.speed = 0;
    g.userData.hp = 3;
    return g;
}

// ---- MOTO ----
function makeMotorcycle(color) {
    const g = new THREE.Group();
    const body = new THREE.MeshLambertMaterial({ color });
    const tire = new THREE.MeshLambertMaterial({ color: 0x151515 });

    [[0, 1.15], [0, -1.15]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(new THREE.TorusGeometry(.42, .14, 8, 16), tire);
        w.position.set(wx, .45, wz); w.castShadow = true; g.add(w);
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, 1.9), body);
    frame.position.y = .85; frame.castShadow = true; g.add(frame);
    const tank = new THREE.Mesh(new THREE.BoxGeometry(.5, .34, .8), body);
    tank.position.set(0, 1.1, .3); g.add(tank);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.44, .18, .7), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    seat.position.set(0, 1.12, -.45); g.add(seat);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(.9, .08, .08), new THREE.MeshLambertMaterial({ color: 0x888888 }));
    handle.position.set(0, 1.35, .85); g.add(handle);
    const light = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff8dc }));
    light.position.set(0, 1.05, 1.05); g.add(light);

    g.userData.type = 'moto';
    g.userData.speed = 0;
    g.userData.hp = 2;
    return g;
}

// ---- BARCO ----
function makeBoat() {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.4, 9),
        new THREE.MeshLambertMaterial({ color: [0xffffff, 0xd32f2f, 0x1565c0, 0x2e7d32][Math.floor(Math.random() * 4)] })
    );
    hull.position.y = .5; hull.castShadow = true; g.add(hull);
    // proa en punta
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3, 4), hull.material);
    bow.rotation.x = -Math.PI / 2; bow.rotation.y = Math.PI / 4;
    bow.position.set(0, .5, 5.6); g.add(bow);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 2.6), new THREE.MeshLambertMaterial({ color: 0xefefef }));
    cabin.position.set(0, 1.9, -1.2); cabin.castShadow = true; g.add(cabin);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(2, .8, .1), new THREE.MeshLambertMaterial({ color: 0x9fd8ef, transparent: true, opacity: .8 }));
    glass.position.set(0, 2.1, .15); g.add(glass);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 4, 6), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
    mast.position.set(0, 4, -1.5); g.add(mast);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .7), new THREE.MeshBasicMaterial({ color: 0xfcd116, side: THREE.DoubleSide }));
    flag.position.set(.6, 5.4, -1.5); g.add(flag);

    g.userData.type = 'boat';
    g.userData.speed = 0;
    g.userData.hp = 4;
    return g;
}

// ---- AVIÓN ----
function makePlane() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdcdcdc });
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(.9, .6, 9, 10), bodyMat);
    fus.rotation.x = Math.PI / 2; fus.castShadow = true; g.add(fus);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(.9, 10, 8), new THREE.MeshLambertMaterial({ color: 0xc62828 }));
    nose.position.z = 4.5; nose.scale.z = 1.6; g.add(nose);
    // alas
    const wing = new THREE.Mesh(new THREE.BoxGeometry(12, .3, 2.4), bodyMat);
    wing.position.set(0, 0, .5); wing.castShadow = true; g.add(wing);
    // cola
    const tailW = new THREE.Mesh(new THREE.BoxGeometry(4.5, .25, 1.3), bodyMat);
    tailW.position.set(0, .3, -4.1); g.add(tailW);
    const tailV = new THREE.Mesh(new THREE.BoxGeometry(.25, 2.2, 1.5), new THREE.MeshLambertMaterial({ color: 0xc62828 }));
    tailV.position.set(0, 1.3, -4.2); g.add(tailV);
    // hélices
    [-3.4, 3.4].forEach(px => {
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, 2.2, 10), new THREE.MeshLambertMaterial({ color: 0x616161 }));
        eng.rotation.x = Math.PI / 2; eng.position.set(px, -.35, 1.2); g.add(eng);
        const prop = new THREE.Mesh(new THREE.BoxGeometry(2.6, .12, .06), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        prop.position.set(px, -.35, 2.4); g.add(prop);
        g.userData.propellers = g.userData.propellers || [];
        g.userData.propellers.push(prop);
    });
    // cabin
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, .6, 3), new THREE.MeshLambertMaterial({ color: 0x2196f3, transparent: true, opacity: .85 }));
    win.position.set(0, .7, 1.8); g.add(win);

    g.userData.type = 'plane';
    g.userData.speed = 0;
    g.userData.hp = 5;
    g.userData.vert = 0;
    return g;
}

// ---- TANQUE ----
function makeTank() {
    const g = new THREE.Group();
    const camo = new THREE.MeshLambertMaterial({ color: 0x4a5d3a });
    // orugas
    [-1.5, 1.5].forEach(sx => {
        const track = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 6.4), new THREE.MeshLambertMaterial({ color: 0x2b2b2b }));
        track.position.set(sx, .75, 0); track.castShadow = true; g.add(track);
    });
    // casco
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 5.8), camo);
    hull.position.y = 1.6; hull.castShadow = true; g.add(hull);
    // torreta
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 1.1, 10), camo);
    turret.position.set(0, 2.7, -.3); turret.castShadow = true; g.add(turret);
    // cañón
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, 5.5, 10), new THREE.MeshLambertMaterial({ color: 0x3d4d33 }));
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 2.8, 3.2); g.add(barrel);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .7, 10), new THREE.MeshLambertMaterial({ color: 0x3d4d33 }));
    tip.rotation.x = Math.PI / 2; tip.position.set(0, 2.8, 5.7); g.add(tip);
    // ametralladora
    const mg = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 1.6, 6), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    mg.rotation.x = Math.PI / 2; mg.position.set(.7, 3.3, .6); g.add(mg);

    g.userData.type = 'tank';
    g.userData.speed = 0;
    g.userData.hp = 10;
    return g;
}

// ============ INICIALIZAR VEHÍCULOS ============
function initVehicles() {
    const colors = ['#8e1b1b', '#1b3a8e', '#1b7a3a', '#c9a227', '#4a1b8e', '#1b6a8e', '#8e5a1b', '#37474f'];
    // tráfico
    for (let i = 0; i < 16; i++) {
        const horizontal = Math.random() > .5;
        const lane = Math.floor(Math.random() * (GRID + 1));
        const roadPos = -HALF + lane * CELL;
        const dir = Math.random() > .5 ? 1 : -1;
        const car = makeCar(colors[i % colors.length]);
        const offset = dir > 0 ? -4 : 4;
        if (horizontal) {
            car.position.set((Math.random() - .5) * CITY, .3, roadPos + offset);
            car.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
            car.userData.axis = 'x'; car.userData.dir = dir;
        } else {
            car.position.set(roadPos - offset, .3, (Math.random() - .5) * CITY);
            car.rotation.y = dir > 0 ? 0 : Math.PI;
            car.userData.axis = 'z'; car.userData.dir = dir;
        }
        car.userData.speed = 7 + Math.random() * 6;
        scene.add(car); vehicles.push(car);
    }
    // motos
    for (let i = 0; i < 5; i++) {
        const moto = makeMotorcycle(colors[(i + 2) % colors.length]);
        const lane = Math.floor(Math.random() * (GRID + 1)) * CELL - HALF;
        const dir = Math.random() > .5 ? 1 : -1;
        if (Math.random() > .5) {
            moto.position.set((Math.random() - .5) * CITY, .3, lane + (dir > 0 ? -4 : 4));
            moto.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
            moto.userData.axis = 'x'; moto.userData.dir = dir;
        } else {
            moto.position.set(lane + (dir > 0 ? 4 : -4), .3, (Math.random() - .5) * CITY);
            moto.rotation.y = dir > 0 ? 0 : Math.PI;
            moto.userData.axis = 'z'; moto.userData.dir = dir;
        }
        moto.userData.speed = 10 + Math.random() * 8;
        scene.add(moto); vehicles.push(moto);
    }
    // patrullas (IA policial)
    for (let i = 0; i < 3; i++) {
        const police = makeCar('#1b5e20', true);
        police.position.set(-60 + i * 55, .3, -45);
        police.userData.axis = 'x'; police.userData.dir = i % 2 ? 1 : -1;
        police.userData.speed = 9;
        police.userData.police = true;
        scene.add(police); policeCars.push(police); vehicles.push(police);
    }
    // carros estacionados (jugador puede entrar)
    for (let i = 0; i < 8; i++) {
        const car = makeCar(colors[(i + 3) % colors.length]);
        const horizontal = Math.random() > .5;
        const lane = Math.floor(Math.random() * GRID);
        const roadPos = -HALF + lane * CELL + CELL / 2 + (Math.random() > .5 ? -7 : 7);
        const along = (Math.random() - .5) * (CITY - 40);
        if (horizontal) {
            car.position.set(along, .3, roadPos);
            car.rotation.y = Math.random() > .5 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            car.position.set(roadPos, .3, along);
            car.rotation.y = Math.random() > .5 ? 0 : Math.PI;
        }
        car.userData.parked = true;
        scene.add(car); vehicles.push(car);
    }
    // moto estacionada
    const pmoto = makeMotorcycle('#d32f2f');
    pmoto.position.set(8, .3, 22);
    pmoto.rotation.y = Math.PI / 2;
    pmoto.userData.parked = true;
    scene.add(pmoto); vehicles.push(pmoto);

    // ---- Barcos ----
    initBoats();
    // ---- Aviones ----
    for (let i = 0; i < 2; i++) {
        const p = makePlane();
        p.position.set(-120 + i * 240, 45 + i * 15, -160 + i * 300);
        p.rotation.y = i ? Math.PI : 0;
        p.userData.cruise = 26;
        p.userData.hp = 5;
        scene.add(p); planeList.push(p); vehicles.push(p);
    }
    // ---- Tanques ----
    for (let i = 0; i < 2; i++) {
        const t = makeTank();
        t.position.set(-170 + i * 60, .3, -170);
        t.userData.parked = true;
        t.userData.speed = 0;
        scene.add(t); tankList.push(t); vehicles.push(t);
    }
    // tanque enemigo (no conducible hasta que lo "robemos")
    const enemyTank = makeTank();
    enemyTank.position.set(160, .3, 160);
    enemyTank.userData.enemy = true;
    enemyTank.userData.axis = 'z'; enemyTank.userData.dir = -1; enemyTank.userData.speed = 2.5;
    scene.add(enemyTank); tankList.push(enemyTank); vehicles.push(enemyTank);
}

function initBoats() {
    if (boatList.length) return;
    for (let i = 0; i < 5; i++) {
        const b = makeBoat();
        b.position.set(WATER_X + 40 + Math.random() * 180, .2, (Math.random() - .5) * 600);
        b.userData.axis = 'z';
        b.userData.dir = Math.random() > .5 ? 1 : -1;
        b.userData.speed = 6 + Math.random() * 6;
        b.userData.cruise = true;
        scene.add(b); boatList.push(b); vehicles.push(b);
    }
    // barco estacionado en el muelle (jugador puede entrar)
    const dock = makeBoat();
    dock.position.set(WATER_X + 8, .2, 60);
    dock.userData.parked = true;
    scene.add(dock); boatList.push(dock); vehicles.push(dock);

    // muelle de madera
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    for (let i = 0; i < 12; i++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(7, .4, 2), woodMat);
        plank.position.set(WATER_X + 4 + i * 2, .6, 60);
        plank.receiveShadow = true;
        scene.add(plank);
        if (i % 3 === 0) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 3.5, 6), woodMat);
            post.position.set(WATER_X + 4 + i * 2, -.5, 57.5);
            scene.add(post);
        }
    }
}

// ============ ACTUALIZAR VEHÍCULOS ============
function updateVehicles(dt) {
    vehicles.forEach(car => {
        if (!car.visible) return;
        const ud = car.userData;

        if (car === playerCar) {
            updatePlayerVehicle(car, dt);
        } else if (ud.cruise && ud.type === 'plane') {
            // vuelo de patrulla
            const dir = new THREE.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
            car.position.addScaledVector(dir, ud.cruise * dt);
            car.position.y = 45 + Math.sin(clock.elapsedTime * .4 + car.position.x) * 4;
            if (ud.propellers) ud.propellers.forEach(p => p.rotation.z += dt * 30);
            const L = 480;
            if (Math.abs(car.position.x) > L || Math.abs(car.position.z) > L) car.rotation.y += Math.PI;
        } else if (ud.type === 'boat' && ud.cruise) {
            car.position.z += ud.dir * ud.speed * dt;
            car.position.y = .2 + Math.sin(clock.elapsedTime * 1.5 + car.position.x) * .25;
            car.rotation.z = Math.sin(clock.elapsedTime * 1.5 + car.position.x) * .05;
            if (car.position.z > 340) ud.dir = -1;
            if (car.position.z < -340) ud.dir = 1;
            car.rotation.y = ud.dir > 0 ? 0 : Math.PI;
        } else if (ud.enemy && ud.type === 'tank') {
            car.position[ud.axis] += ud.dir * ud.speed * dt;
            if (Math.abs(car.position[ud.axis]) > HALF - 10) ud.dir *= -1;
            car.rotation.y = ud.dir > 0 ? 0 : Math.PI;
        } else if (ud.police) {
            // patrulla: patrulla por la ciudad
            car.position[ud.axis] += ud.dir * ud.speed * dt;
            const L = HALF + 8;
            if (car.position[ud.axis] > L) car.position[ud.axis] = -L;
            if (car.position[ud.axis] < -L) car.position[ud.axis] = L;
        } else if (!ud.parked && ud.speed) {
            car.position[ud.axis] += ud.dir * ud.speed * dt;
            const L = HALF + 10;
            if (car.position[ud.axis] > L) car.position[ud.axis] = -L;
            if (car.position[ud.axis] < -L) car.position[ud.axis] = L;
        }

        // balizo policía
        if (ud.beacon) {
            const on = Math.floor(clock.elapsedTime * 4) % 2;
            ud.beacon[0].visible = on === 0;
            ud.beacon[1].visible = on === 1;
        }
    });
}

function updatePlayerVehicle(car, dt) {
    const ud = car.userData;
    const type = ud.type;
    const inWater = type === 'boat';
    const inAir = type === 'plane';

    if (keys['KeyW'] || keys['KeyS']) {
        const acc = (type === 'tank' ? 6 : type === 'boat' ? 8 : type === 'plane' ? 14 : 16) * dt;
        if (keys['KeyW']) ud.speed = Math.min((ud.speed || 0) + acc, type === 'tank' ? 9 : type === 'boat' ? 18 : type === 'plane' ? 40 : 22);
        else ud.speed = Math.max((ud.speed || 0) - (type === 'plane' ? 10 : 26) * dt, type === 'plane' ? -5 : -8);
    } else if (!inAir) {
        ud.speed = (ud.speed || 0) * (1 - (inWater ? .5 : 1.2) * dt);
    }

    // dirección
    if (Math.abs(ud.speed) > .5) {
        const steer = (type === 'tank' ? .7 : type === 'boat' ? 1.1 : 1.8) * dt * Math.sign(ud.speed);
        if (keys['KeyA']) car.rotation.y += steer;
        if (keys['KeyD']) car.rotation.y -= steer;
    }

    const dir = new THREE.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
    car.position.addScaledVector(dir, ud.speed * dt);

    if (inAir) {
        // ascenso/descenso
        if (keys['Space']) ud.vert = Math.min((ud.vert || 0) + 14 * dt, 14);
        else if (keys['ShiftLeft'] || keys['KeyS']) ud.vert = Math.max((ud.vert || 0) - 10 * dt, -10);
        else ud.vert = (ud.vert || 0) * (1 - .6 * dt);
        car.position.y += ud.vert * dt;
        if (car.position.y < 2.5) { car.position.y = 2.5; ud.vert = Math.max(0, ud.vert); health = Math.max(0, health - (Math.abs(ud.speed) > 20 ? 40 : 5)); ud.speed *= .5; }
        car.rotation.z = (keys['KeyA'] ? .3 : keys['KeyD'] ? -.3 : 0);
        car.rotation.x = -ud.vert * .04;
        if (ud.propellers) ud.propellers.forEach(p => p.rotation.z += dt * 30);
        const L = 600;
        car.position.x = Math.max(-L, Math.min(L, car.position.x));
        car.position.z = Math.max(-L, Math.min(L, car.position.z));
    } else if (inWater) {
        // flotar
        car.position.y = .2 + Math.sin(clock.elapsedTime * 1.6) * .25;
        car.rotation.z = Math.sin(clock.elapsedTime * 1.6) * .06;
        // no salir del agua
        if (car.position.x < WATER_X + 1) { car.position.x = WATER_X + 1; ud.speed *= -.3; health = Math.max(0, health - 8); }
        const L = 430;
        car.position.z = Math.max(-L, Math.min(L, car.position.z));
        if (car.position.x > WATER_X + 380) { car.position.x = WATER_X + 380; ud.speed *= -.3; }
    } else {
        // terrestre: límites + fricción con acera
        const L = HALF + (car.position.x > HALF - 10 ? 60 : 3);
        if (Math.abs(car.position.z) > HALF + 3) {
            ud.speed *= -.25;
            car.position.z = Math.max(-HALF - 3, Math.min(HALF + 3, car.position.z));
            if (Math.abs(ud.speed) > 8) { health = Math.max(0, health - 6); AudioSys.beep(90, .2, 'square', .2); }
        }
        if (car.position.x < -HALF - 3) { car.position.x = -HALF - 3; ud.speed *= -.25; }
        if (car.position.x > HALF + 3 && car.position.x < WATER_X - 6) { car.position.x = HALF + 3; ud.speed *= -.25; }
        // choque contra la orilla
        if (car.position.x >= WATER_X - 6 && ud.type !== 'boat') {
            car.position.x = WATER_X - 7;
            ud.speed *= -.3;
            health = Math.max(0, health - 8);
        }
        car.position.y = type === 'tank' || type === 'moto' ? .3 : .3;
    }

    // cámara sigue al vehículo
    playerGroup.position.copy(car.position);
    playerGroup.rotation.y = car.rotation.y;
}

// ============ ENTRAR / SALIR ============
function tryEnterVehicle() {
    if (playerCar) {
        const type = playerCar.userData.type;
        playerCar.userData.speed = 0;
        if (type === 'boat') playerCar.userData.cruise = false;
        playerCar = null;
        playerGroup.visible = true;
        playerGroup.position.x += type === 'boat' ? 4 : 3;
        playerGroup.position.y = .3;
        AudioSys.engine(0);
        if (playerGroup.userData.gun) playerGroup.userData.gun.visible = true;
        return;
    }
    const px = playerGroup.position.x, pz = playerGroup.position.z;
    let best = null, bestD = 5.5;
    for (const car of vehicles) {
        if (!car.visible) continue;
        if (car.userData.police && wantedLevel === 0 && !car.userData.parked) { /* permitido robar igual */ }
        const d = Math.hypot(car.position.x - px, car.position.z - pz) + Math.abs(car.position.y - playerGroup.position.y) * 1.5;
        if (d < bestD) { bestD = d; best = car; }
    }
    if (!best) return;

    playerCar = best;
    playerGroup.visible = false;
    if (playerGroup.userData.gun) playerGroup.userData.gun.visible = false;
    const ud = best.userData;
    if (ud.parked) {
        ud.parked = false;
        if (ud.type === 'boat') { ud.cruise = false; }
        else if (ud.type === 'plane') { ud.cruise = 0; ud.axis = 'x'; ud.dir = 1; }
        else if (ud.type !== 'tank' || ud.enemy) { ud.axis = 'x'; ud.dir = 1; }
        ud.enemy = false;
        ud.speed = 0;
    }
    if (ud.police || ud.enemy || wantedLevel > 0) raiseWanted(1);
    AudioSys.beep(320, .1, 'triangle', .14, 500);
    updateHUD();
}

// ============ POLICÍA / BÚSQUEDA ============
function updatePolice(dt) {
    if (wantedLevel <= 0) return;
    const tgt = playerCar ? playerCar.position : playerGroup.position;
    policeCars.forEach(p => {
        if (!p.visible) return;
        const ud = p.userData;
        const dx = tgt.x - p.position.x, dz = tgt.z - p.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 120 && dist > 8) {
            // perseguir
            const targetRot = Math.atan2(dx, dz);
            let diff = targetRot - p.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            p.rotation.y += diff * Math.min(1, dt * 2.2);
            const spd = 10 + wantedLevel * 3.5;
            p.position.x += Math.sin(p.rotation.y) * spd * dt;
            p.position.z += Math.cos(p.rotation.y) * spd * dt;
            ud.speed = spd;
        }
        // daño al jugador si está muy cerca
        if (dist < 4.5) {
            health = Math.max(0, health - 12 * dt);
            if (Math.random() < dt * .5) AudioSys.beep(200, .06, 'square', .1);
        }
    });
    // vida se recupera poco si no hay estrellas
    if (wantedLevel === 0 && health < 100) health = Math.min(100, health + 2 * dt);
}

// ============ PEATONES ============
function initPedestrians() {
    const shirts = ['#e53935', '#8e24aa', '#039be5', '#00897b', '#fdd835', '#fb8c00', '#5e35b1', '#d81b60'];
    const pants = ['#37474f', '#5d4037', '#1565c0', '#212121', '#4e342e'];
    const skins = ['#d9a066', '#a1662f', '#6d4c41', '#f0c8a0', '#8d5524'];
    for (let i = 0; i < 26; i++) {
        const g = new THREE.Group();
        const shirtMat = new THREE.MeshLambertMaterial({ color: shirts[i % shirts.length] });
        const pantsMat = new THREE.MeshLambertMaterial({ color: pants[Math.floor(Math.random() * pants.length)] });
        const skinMat = new THREE.MeshLambertMaterial({ color: skins[Math.floor(Math.random() * skins.length)] });

        const legL = new THREE.Mesh(new THREE.BoxGeometry(.26, .75, .26), pantsMat);
        legL.position.set(-.14, .37, 0); g.add(legL);
        const legR = legL.clone(); legR.position.x = .14; g.add(legR);
        const torso = new THREE.Mesh(new THREE.BoxGeometry(.62, .72, .36), shirtMat);
        torso.position.y = 1.1; torso.castShadow = true; g.add(torso);
        const head = new THREE.Mesh(new THREE.BoxGeometry(.4, .44, .38), skinMat);
        head.position.y = 1.7; head.castShadow = true; g.add(head);
        const hair = new THREE.Mesh(new THREE.BoxGeometry(.42, .14, .4), new THREE.MeshLambertMaterial({ color: Math.random() > .5 ? 0x1a1a1a : 0x4e342e }));
        hair.position.y = 1.97; g.add(hair);
        const armL = new THREE.Mesh(new THREE.BoxGeometry(.2, .62, .2), skinMat);
        armL.position.set(-.43, 1.1, 0); g.add(armL);
        const armR = armL.clone(); armR.position.x = .43; g.add(armR);

        g.userData = { legL, legR, armL, armR, speed: 1.3 + Math.random() * 1.6, turn: Math.random() * 6, hp: 2 };
        g.position.set((Math.random() - .5) * (CITY - 30), .3, (Math.random() - .5) * (CITY - 30));
        g.rotation.y = Math.random() * Math.PI * 2;
        scene.add(g); pedestrians.push(g);
    }
    // peatón en la playa
    for (let i = 0; i < 6; i++) {
        const src = pedestrians[i];
        const clone = src.clone(true);
        clone.position.set(HALF + 10 + Math.random() * 35, .3, (Math.random() - .5) * (CITY - 60));
        clone.userData = { ...src.userData, legL: clone.children[0], legR: clone.children[1], armL: clone.children[5], armR: clone.children[6] };
        scene.add(clone); pedestrians.push(clone);
    }
}

function updatePedestrians(dt) {
    const t = clock.elapsedTime;
    pedestrians.forEach(p => {
        const ud = p.userData;
        if (ud.dead) return;
        if (ud.hurt > 0) ud.hurt -= dt;
        p.position.x += Math.sin(p.rotation.y) * ud.speed * dt;
        p.position.z += Math.cos(p.rotation.y) * ud.speed * dt;
        ud.turn -= dt;
        if (ud.turn < 0) { p.rotation.y += (Math.random() - .5) * 2.5; ud.turn = 2 + Math.random() * 5; }
        // evitar el mar
        if (p.position.x > WATER_X - 4) { p.rotation.y = Math.PI / 2 + (Math.random() - .5); p.position.x = WATER_X - 5; }
        const L = HALF - 6;
        if (Math.abs(p.position.x) > L || Math.abs(p.position.z) > L) {
            p.rotation.y += Math.PI;
            p.position.x = Math.max(-L, Math.min(L, p.position.x));
            p.position.z = Math.max(-L, Math.min(L, p.position.z));
        }
        const sw = Math.sin(t * 7 + ud.speed * 10) * .45;
        ud.legL.rotation.x = sw; ud.legR.rotation.x = -sw;
        ud.armL.rotation.x = -sw * .6; ud.armR.rotation.x = sw * .6;
        // esquivar al jugador con arma
        if (wantedLevel > 0) {
            const dx = p.position.x - playerGroup.position.x;
            const dz = p.position.z - playerGroup.position.z;
            const d = Math.hypot(dx, dz);
            if (d < 14) p.rotation.y = Math.atan2(dx, dz) + Math.PI;
        }
    });
}

// ============ PICKUPS ============
function initPickups() {
    const defs = [
        { type: 'health', color: 0xff4444, icon: '❤️', n: 8 },
        { type: 'armor',  color: 0x4488ff, icon: '🛡️', n: 5 },
        { type: 'money',  color: 0x44dd66, icon: '💵', n: 10 },
        { type: 'weapon', color: 0xffaa22, icon: '🔫', n: 4 }
    ];
    defs.forEach(d => {
        for (let i = 0; i < d.n; i++) {
            const g = new THREE.Group();
            const core = new THREE.Mesh(
                new THREE.OctahedronGeometry(.55),
                new THREE.MeshBasicMaterial({ color: d.color })
            );
            core.position.y = 1.1;
            g.add(core);
            // halo
            const halo = new THREE.Mesh(
                new THREE.RingGeometry(.7, .95, 20),
                new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false })
            );
            halo.rotation.x = -Math.PI / 2;
            halo.position.y = .4;
            g.add(halo);
            // brillo
            const light = new THREE.PointLight(d.color, .5, 6);
            light.position.y = 1.2;
            g.add(light);

            g.userData = { pickup: d.type, core, base: 1.1 };
            if (d.type === 'weapon') g.position.set((Math.random() - .5) * (CITY - 40), .3, (Math.random() - .5) * (CITY - 40));
            else if (Math.random() > .5) g.position.set((Math.random() - .5) * (CITY - 40), .3, Math.floor(Math.random() * GRID) * CELL - HALF + CELL / 2);
            else g.position.set(Math.floor(Math.random() * GRID) * CELL - HALF + CELL / 2, .3, (Math.random() - .5) * (CITY - 40));
            scene.add(g); pickups.push(g);
        }
    });
}

function updatePickups(dt) {
    const p = playerCar ? playerCar.position : playerGroup.position;
    const t = clock.elapsedTime;
    for (let i = pickups.length - 1; i >= 0; i--) {
        const pk = pickups[i];
        pk.userData.core.rotation.y += dt * 2.5;
        pk.userData.core.position.y = pk.userData.base + Math.sin(t * 2 + i) * .15;
        if (Math.hypot(pk.position.x - p.x, pk.position.z - p.z) < 3) {
            const type = pk.userData.pickup;
            if (type === 'health') { if (health >= 100) continue; health = Math.min(100, health + 50); showToast('❤️ <b>+50 vida</b>', '#ff5252'); }
            else if (type === 'armor') { if (armor >= 100) continue; armor = Math.min(100, armor + 50); showToast('🛡️ <b>+50 armadura</b>', '#4488ff'); }
            else if (type === 'money') { money += 250; showToast('💵 <b>+$250</b>', '#44dd66'); }
            else if (type === 'weapon') {
                const w = (currentWeapon + 1) % WEAPONS.length;
                selectWeapon(w); showToast(`🔫 <b>${WEAPONS[w].name}</b> conseguida`, '#ffaa22');
            }
            AudioSys.pickup();
            scene.remove(pk); pickups.splice(i, 1);
            // reaparece después
            setTimeout(() => { if (gameState !== 'menu') { scene.add(pk); pickups.push(pk); } }, 30000);
        }
    }
}
