// ============ Ciudad · Playa · Océano — Edición Definitiva ============
const CELL = 90;          // tamaño de manzana (con calle)
const ROAD = 18;          // ancho de calle
const GRID = 5;           // 5x5 manzanas
const HALF = (GRID * CELL) / 2;   // 225
const CITY = GRID * CELL;         // 450
const BEACH_X = HALF;             // la ciudad termina aquí; hacia +X: playa y mar
const WATER_X = HALF + 55;        // empieza el océano

const FACADES = [
    ['#d9b38c', 'Marfil'], ['#c98a76', 'Terracota'], ['#a8c5d4', 'Celeste'],
    ['#e0c9a6', 'Crema'], ['#b8a9c9', 'Lila'], ['#9fb8a8', 'Verde agua'],
    ['#d4a5a5', 'Rosado'], ['#c5b89a', 'Arena']
];
const SHOPS = ['TIENDA', 'CAFÉ', 'MERCADO', 'FARMACIA', 'PANADERÍA', 'SALÓN', 'BAR', 'MOTEL'];
const BILLBOARDS = ['PAISITA', 'CAFÉ ANDINO', 'TROPICAL', 'RON DEL PAÍS', 'AREPA', 'FIESTA', 'PLAYA AZUL', 'GASEOSA'];

function initCity() {
    // --- Suelo: asfalto de toda la ciudad ---
    const roadTex = roadTexture();
    roadTex.repeat.set(CITY / 18, CITY / 18);
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(CITY + 60, CITY + 60),
        new THREE.MeshLambertMaterial({ map: roadTex })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Manzanas ---
    const swTex = sidewalkTexture();
    const grassTex = grassTexture();

    for (let gx = 0; gx < GRID; gx++) {
        for (let gz = 0; gz < GRID; gz++) {
            const bx = -HALF + gx * CELL + ROAD / 2;
            const bz = -HALF + gz * CELL + ROAD / 2;
            const size = CELL - ROAD;

            const st = swTex.clone(); st.needsUpdate = true;
            st.repeat.set(size / 6, size / 6);
            const walk = new THREE.Mesh(
                new THREE.BoxGeometry(size, .3, size),
                new THREE.MeshLambertMaterial({ map: st })
            );
            walk.position.set(bx + size / 2, .15, bz + size / 2);
            walk.receiveShadow = true;
            scene.add(walk);

            const gt = grassTex.clone(); gt.needsUpdate = true;
            gt.repeat.set(4, 4);
            const inner = new THREE.Mesh(
                new THREE.PlaneGeometry(size - 10, size - 10),
                new THREE.MeshLambertMaterial({ map: gt })
            );
            inner.rotation.x = -Math.PI / 2;
            inner.position.set(bx + size / 2, .31, bz + size / 2);
            inner.receiveShadow = true;
            scene.add(inner);

            placeBlockBuildings(bx, bz, size);

            if (Math.random() > .35) {
                const px = bx + 2 + Math.random() * (size - 4);
                const pz = Math.random() > .5 ? bz + 1.6 : bz + size - 1.6;
                makePalm(px, pz);
            }
            if (Math.random() > .5) {
                const pz = bz + 2 + Math.random() * (size - 4);
                const px = Math.random() > .5 ? bx + 1.6 : bx + size - 1.6;
                makePalm(px, pz);
            }
            makeLamp(bx - 1.5, bz - 1.5);
        }
    }

    makeStreetDetails();
    makeBeach();
    makeSafehouse();
    makeBillboards();
}

function placeBlockBuildings(bx, bz, size) {
    const sides = [
        { x: bx, z: bz, w: size, d: 14, rot: 0 },
        { x: bx, z: bz + size - 14, w: size, d: 14, rot: 0 },
        { x: bx, z: bz + 14, w: 14, d: size - 28, rot: 1 },
        { x: bx + size - 14, z: bz + 14, w: 14, d: size - 28, rot: 1 }
    ];

    sides.forEach(side => {
        if (side.w < 20 || side.d < 16) return;
        const n = Math.max(1, Math.floor((side.rot ? side.d : side.w) / 26));
        for (let i = 0; i < n; i++) {
            if (Math.random() < .18) continue;
            const [col] = FACADES[Math.floor(Math.random() * FACADES.length)];
            const along = side.rot ? side.d : side.w;
            const seg = along / n;
            const w = side.rot ? side.w : seg - 2;
            const d = side.rot ? seg - 2 : side.d;
            const h = 10 + Math.random() * 40;
            const x = side.rot ? side.x : side.x + i * seg + 1;
            const z = side.rot ? side.z + i * seg + 1 : side.z;

            const hasStore = Math.random() < .45 && h > 14;
            const tex = facadeTexture(col, h > 26 ? 26 : h > 16 ? 22 : 18,
                Math.max(2, Math.round(w / 7)), {
                storefront: hasStore,
                shop: SHOPS[Math.floor(Math.random() * SHOPS.length)],
                sign: ['#c62828', '#1565c0', '#2e7d32', '#f9a825'][Math.floor(Math.random() * 4)],
                litChance: .4,
                balcony: h > 20
            });

            const mats = [
                new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex }),
                new THREE.MeshLambertMaterial({ color: 0x6d6d6d }), new THREE.MeshLambertMaterial({ color: 0x555555 }),
                new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex })
            ];
            const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
            b.position.set(x + w / 2, h / 2 + .3, z + d / 2);
            b.castShadow = b.receiveShadow = true;
            scene.add(b);

            const corn = new THREE.Mesh(
                new THREE.BoxGeometry(w + .8, .7, d + .8),
                new THREE.MeshLambertMaterial({ color: 0xe8e0d4 })
            );
            corn.position.set(x + w / 2, h + .65, z + d / 2);
            corn.castShadow = true;
            scene.add(corn);

            // Tanque de agua colombiano en el techo
            if (Math.random() < .55) {
                const tank = new THREE.Mesh(
                    new THREE.CylinderGeometry(1.3, 1.3, 2.4, 10),
                    new THREE.MeshLambertMaterial({ color: Math.random() > .5 ? 0x2196f3 : 0x9e9e9e })
                );
                tank.position.set(x + w / 2 + (Math.random() - .5) * w * .4, h + 2, z + d / 2 + (Math.random() - .5) * d * .4);
                tank.castShadow = true;
                scene.add(tank);
            }
            // Antena
            if (Math.random() < .3) {
                const ant = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3, 5), new THREE.MeshLambertMaterial({ color: 0x999999 }));
                ant.position.set(x + w / 2, h + 2.5, z + d / 2);
                scene.add(ant);
            }
        }
    });
}

// ---------- Playa y océano ----------
function makeBeach() {
    const sandTex = sandTexture();
    sandTex.repeat.set(8, 18);
    const beach = new THREE.Mesh(
        new THREE.PlaneGeometry(55, CITY + 80),
        new THREE.MeshLambertMaterial({ map: sandTex })
    );
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(HALF + 27.5, .1, 0);
    beach.receiveShadow = true;
    scene.add(beach);

    // Océano animado (malla subdividida)
    const waterGeo = new THREE.PlaneGeometry(600, 900, 48, 64);
    const waterMat = new THREE.MeshPhongMaterial({
        color: 0x1a7f9e, transparent: true, opacity: .88,
        shininess: 90, specular: 0x9adfff, flatShading: false
    });
    waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(WATER_X + 260, -.4, 0);
    scene.add(waterMesh);

    // Orilla espumosa
    const foam = new THREE.Mesh(
        new THREE.PlaneGeometry(6, CITY + 80),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(WATER_X - 2, .05, 0);
    scene.add(foam);

    // Palmeras en la playa
    for (let i = 0; i < 14; i++) {
        makePalm(HALF + 6 + Math.random() * 38, (Math.random() - .5) * (CITY - 40));
    }

    // Sombrillas
    for (let i = 0; i < 8; i++) {
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.4, 6), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
        pole.position.y = 1.2; g.add(pole);
        const col = [0xff5f9e, 0xffd93d, 0x4dd0e1, 0x6bcb77][i % 4];
        const top = new THREE.Mesh(new THREE.ConeGeometry(1.7, .7, 8), new THREE.MeshLambertMaterial({ color: col, side: THREE.DoubleSide }));
        top.position.y = 2.5; top.castShadow = true; g.add(top);
        g.position.set(HALF + 14 + Math.random() * 30, .1, (Math.random() - .5) * (CITY - 60));
        g.rotation.y = Math.random() * Math.PI;
        scene.add(g);
    }

    // Barcos en el mar
    initBoats();
}

// ---------- Casa franca ----------
function makeSafehouse() {
    const g = new THREE.Group();
    // casa estilo colombiano
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5e6c8 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 9), wallMat);
    walls.position.y = 2.5; walls.castShadow = walls.receiveShadow = true; g.add(walls);
    // techo de tejas
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 3.2, 4), new THREE.MeshLambertMaterial({ color: 0xb5502f }));
    roof.position.y = 6.6; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
    // puerta
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, .2), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
    door.position.set(0, 1.4, 4.6); g.add(door);
    // ventanas
    [-3, 3].forEach(vx => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, .2), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
        win.position.set(vx, 3, 4.6); g.add(win);
    });
    // cartel
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1),
        new THREE.MeshBasicMaterial({ map: textTexture('🏠 CASA FRANCA', '#1b5e20', '#fff', 256, 56, 'bold 26px Arial') }));
    sign.position.set(0, 4.6, 4.62); g.add(sign);

    // halo de luz (marca en el radar)
    const halo = new THREE.Mesh(new THREE.RingGeometry(4.4, 5.4, 32),
        new THREE.MeshBasicMaterial({ color: 0x4dd0e1, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = .4;
    g.add(halo);
    g.userData.halo = halo;

    g.position.set(safehousePos.x, .3, safehousePos.z);
    scene.add(g);
    scene.userData.safehouse = g;

    // Palmas alrededor
    makePalm(safehousePos.x - 8, safehousePos.z - 7);
    makePalm(safehousePos.x + 8, safehousePos.z + 6);
}

// ---------- Rótulos publicitarios (neones) ----------
function makeBillboards() {
    for (let i = 0; i < 10; i++) {
        const g = new THREE.Group();
        const name = BILLBOARDS[i % BILLBOARDS.length];
        const colors = [['#ff6b9d', '#1a0a2e'], ['#ffd93d', '#1a0a2e'], ['#4dd0e1', '#0d2b3e'], ['#6bcb77', '#0d2415']][i % 4];
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(12, 4.5, .5),
            [
                new THREE.MeshBasicMaterial({ map: textTexture(name, colors[0], colors[1], 512, 192, 'bold 56px Arial') }),
                new THREE.MeshBasicMaterial({ color: 0x222222 }),
                new THREE.MeshBasicMaterial({ color: 0x222222 }),
                new THREE.MeshBasicMaterial({ color: 0x222222 }),
                new THREE.MeshBasicMaterial({ map: textTexture(name, colors[0], colors[1], 512, 192, 'bold 56px Arial') }),
                new THREE.MeshBasicMaterial({ color: 0x222222 })
            ]
        );
        panel.position.y = 9;
        g.add(panel);
        // soporte
        [-4, 4].forEach(sx => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(.18, .24, 9, 6), new THREE.MeshLambertMaterial({ color: 0x546e7a }));
            leg.position.set(sx, 4.5, 0);
            g.add(leg);
        });
        // luz neón
        const neon = new THREE.PointLight(new THREE.Color(colors[0]), .8, 26);
        neon.position.set(0, 8, 2);
        g.add(neon);

        const edge = Math.random() > .5;
        const lane = Math.floor(Math.random() * GRID) * CELL - HALF + CELL / 2;
        const along = (Math.random() - .5) * (CITY - 60);
        if (edge) {
            g.position.set(-HALF + 4, .3, along);
            g.rotation.y = Math.PI / 2;
        } else {
            g.position.set(along, .3, -HALF + 4);
        }
        scene.add(g);
    }
}

// ---------- Calle: marcas viales ----------
function makeStreetDetails() {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < GRID; i++) {
        const p = -HALF + i * CELL;
        const cx = p + CELL / 2, cz = p + CELL / 2;
        for (let s = -3; s <= 3; s++) {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 8), whiteMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(cx + s * 2.4, .04, p - ROAD / 2);
            scene.add(stripe);
            const stripe2 = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.4), whiteMat);
            stripe2.rotation.x = -Math.PI / 2;
            stripe2.position.set(p - ROAD / 2, .04, cz + s * 2.4);
            scene.add(stripe2);
        }
    }
}

// ---------- Palmeras ----------
function makePalm(x, z) {
    const g = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    const lean = (Math.random() - .5) * .18;
    for (let i = 0; i < 7; i++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(.16 - i * .012, .22 - i * .012, 1.4, 7), trunkMat);
        seg.position.set(lean * i * i * .35, .7 + i * 1.3, 0);
        seg.rotation.z = -lean * i * .3;
        seg.castShadow = true;
        g.add(seg);
    }
    const topX = lean * 6 * 6 * .35, topY = 9.9;
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f7d32, side: THREE.DoubleSide });
    for (let l = 0; l < 9; l++) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.1), leafMat);
        leaf.position.set(topX, topY, 0);
        leaf.rotation.y = (l / 9) * Math.PI * 2;
        leaf.rotation.z = -.45;
        leaf.translateX(1.9);
        leaf.castShadow = true;
        g.add(leaf);
        if (l % 3 === 0) {
            const coco = new THREE.Mesh(new THREE.SphereGeometry(.22, 6, 6), new THREE.MeshLambertMaterial({ color: 0x6d4c41 }));
            coco.position.set(topX + Math.cos(l) * .5, topY - .4, Math.sin(l) * .5);
            g.add(coco);
        }
    }
    g.position.set(x, .3, z);
    scene.add(g);
}

// ---------- Farolas ----------
function makeLamp(x, z) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .11, 5.5, 6), new THREE.MeshLambertMaterial({ color: 0x455a64 }));
    pole.position.y = 2.75; pole.castShadow = true;
    g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, .1, .1), new THREE.MeshLambertMaterial({ color: 0x455a64 }));
    arm.position.set(.7, 5.4, 0);
    g.add(arm);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }));
    bulb.position.set(1.3, 5.3, 0);
    g.add(bulb);
    const glow = new THREE.PointLight(0xffe0a0, .5, 14);
    glow.position.set(1.3, 5.2, 0);
    g.add(glow);
    g.position.set(x, .3, z);
    g.rotation.y = Math.random() * Math.PI * 2;
    scene.add(g);
}
