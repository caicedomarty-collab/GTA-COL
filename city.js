// Ciudad estilo GTA Vice City con aceras, edificios y fachadas
const BLOCK_SIZE = 40;
const ROAD_WIDTH = 14;
const SIDEWALK_WIDTH = 3;
const GRID = 7; // 7x7 manzanas
const CITY_SIZE = GRID * (BLOCK_SIZE + ROAD_WIDTH);

// Paleta de colores Vice City (rosas, turquesa, crema, art deco)
const VC_COLORS = {
    buildings: [0xf5b7b1, 0xd5f5e3, 0xfadbd8, 0xd6eaf8, 0xf9e79f, 0xf8c471, 0xe8daef, 0xf5cba7, 0xffeaa7, 0xabebc6],
    roofs: [0xd98880, 0x76d7c4, 0xf1948a, 0x85c1e9, 0xf7dc6f],
    roads: 0x3d3d3d,
    sidewalks: 0x9e9e9e,
    grass: 0x4caf50
};

function initCity() {
    // Suelo base (asfalto oscuro)
    const groundGeo = new THREE.PlaneGeometry(CITY_SIZE + 200, CITY_SIZE + 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: VC_COLORS.roads });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Crear calles y manzanas
    createRoads();
    
    // Crear edificios en cada manzana
    for (let gx = 0; gx < GRID; gx++) {
        for (let gz = 0; gz < GRID; gz++) {
            const blockX = gx * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2;
            const blockZ = gz * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2;
            createCityBlock(blockX, blockZ);
        }
    }
    
    // Palmeras en las aceras
    createPalmTrees();
    
    // Farolas
    createStreetLamps();
}

function createRoads() {
    const roadMat = new THREE.MeshLambertMaterial({ color: VC_COLORS.roads });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: VC_COLORS.sidewalks });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i <= GRID; i++) {
        const pos = i * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2 - BLOCK_SIZE / 2 - ROAD_WIDTH / 2;
        
        // Calle horizontal (carril doble con línea central)
        const roadH = new THREE.Mesh(new THREE.BoxGeometry(CITY_SIZE + ROAD_WIDTH, 0.05, ROAD_WIDTH), roadMat);
        roadH.position.set(0, 0.025, pos);
        roadH.receiveShadow = true;
        scene.add(roadH);
        
        // Línea central discontinua
        for (let x = -CITY_SIZE / 2; x < CITY_SIZE / 2; x += 6) {
            const line = new THREE.Mesh(new THREE.BoxGeometry(3, 0.06, 0.3), lineMat);
            line.position.set(x, 0.04, pos);
            scene.add(line);
        }
        
        // Calle vertical
        const roadV = new THREE.Mesh(new THREE.BoxGeometry(ROAD_WIDTH, 0.05, CITY_SIZE + ROAD_WIDTH), roadMat);
        roadV.position.set(pos, 0.025, 0);
        roadV.receiveShadow = true;
        scene.add(roadV);
        
        for (let z = -CITY_SIZE / 2; z < CITY_SIZE / 2; z += 6) {
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 3), lineMat);
            line.position.set(pos, 0.04, z);
            scene.add(line);
        }
    }
}

function createCityBlock(blockX, blockZ) {
    // Aceras alrededor de la manzana
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: VC_COLORS.sidewalks });
    
    const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(BLOCK_SIZE + SIDEWALK_WIDTH * 2, 0.15, BLOCK_SIZE + SIDEWALK_WIDTH * 2),
        sidewalkMat
    );
    sidewalk.position.set(blockX + BLOCK_SIZE / 2, 0.075, blockZ + BLOCK_SIZE / 2);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);
    
    // Interior de la manzana (césped o concreto)
    const interior = new THREE.Mesh(
        new THREE.BoxGeometry(BLOCK_SIZE, 0.16, BLOCK_SIZE),
        new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? VC_COLORS.grass : 0x8d6e63 })
    );
    interior.position.set(blockX + BLOCK_SIZE / 2, 0.08, blockZ + BLOCK_SIZE / 2);
    interior.receiveShadow = true;
    scene.add(interior);
    
    // Edificios alrededor de la manzana (como en Vice City)
    const numBuildings = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < numBuildings; b++) {
        const side = Math.floor(Math.random() * 4);
        let bx, bz, bw, bd;
        
        const bwBase = 8 + Math.random() * 10;
        const bdBase = 8 + Math.random() * 10;
        
        switch(side) {
            case 0: // Norte
                bx = blockX + Math.random() * (BLOCK_SIZE - bwBase);
                bz = blockZ;
                bw = bwBase; bd = bdBase;
                break;
            case 1: // Sur
                bx = blockX + Math.random() * (BLOCK_SIZE - bwBase);
                bz = blockZ + BLOCK_SIZE - bdBase;
                bw = bwBase; bd = bdBase;
                break;
            case 2: // Oeste
                bx = blockX;
                bz = blockZ + Math.random() * (BLOCK_SIZE - bdBase);
                bw = bwBase; bd = bdBase;
                break;
            case 3: // Este
                bx = blockX + BLOCK_SIZE - bwBase;
                bz = blockZ + Math.random() * (BLOCK_SIZE - bdBase);
                bw = bwBase; bd = bdBase;
                break;
        }
        
        createBuilding(bx, bz, bw, bd);
    }
}

function createBuilding(x, z, width, depth) {
    const height = 8 + Math.random() * 35;
    const color = VC_COLORS.buildings[Math.floor(Math.random() * VC_COLORS.buildings.length)];
    
    // Cuerpo del edificio
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(x + width / 2, height / 2 + 0.16, z + depth / 2);
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);
    
    // Techo
    const roofColor = VC_COLORS.roofs[Math.floor(Math.random() * VC_COLORS.roofs.length)];
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5),
        new THREE.MeshLambertMaterial({ color: roofColor })
    );
    roof.position.set(x + width / 2, height + 0.4, z + depth / 2);
    scene.add(roof);
    
    // Ventanas (rejilla de ventanas en las caras)
    const windowMat = new THREE.MeshLambertMaterial({ 
        color: 0x87ceeb, 
        emissive: Math.random() > 0.7 ? 0xffdd88 : 0x111122,
        emissiveIntensity: Math.random() > 0.7 ? 0.5 : 0.1
    });
    
    const floors = Math.floor(height / 3.5);
    const colsX = Math.floor(width / 2.5);
    const colsZ = Math.floor(depth / 2.5);
    
    // Ventanas cara frontal (z positivo)
    for (let f = 0; f < floors; f++) {
        for (let c = 0; c < colsX; c++) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.1), windowMat);
            win.position.set(
                x + 1.5 + c * 2.5,
                2 + f * 3.5,
                z + depth + 0.06
            );
            scene.add(win);
        }
    }
    
    // Ventanas cara trasera (z negativo)
    for (let f = 0; f < floors; f++) {
        for (let c = 0; c < colsX; c++) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.1), windowMat);
            win.position.set(
                x + 1.5 + c * 2.5,
                2 + f * 3.5,
                z - 0.06
            );
            scene.add(win);
        }
    }
    
    // Puerta en el lado que da a la calle
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x5d4037 })
    );
    door.position.set(x + width / 2, 1.66, z + depth + 0.1);
    scene.add(door);
    
    // Letrero de tienda (barra de color en planta baja)
    if (Math.random() > 0.4) {
        const signColor = [0xff6b9d, 0x6bcb77, 0xffd93d, 0x74b9ff][Math.floor(Math.random() * 4)];
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(width - 1, 0.8, 0.3),
            new THREE.MeshLambertMaterial({ color: signColor, emissive: signColor, emissiveIntensity: 0.4 })
        );
        sign.position.set(x + width / 2, 4, z + depth + 0.15);
        scene.add(sign);
    }
}

function createPalmTrees() {
    for (let i = 0; i < 40; i++) {
        // Posición en acera aleatoria
        const gx = Math.floor(Math.random() * GRID);
        const gz = Math.floor(Math.random() * GRID);
        const side = Math.floor(Math.random() * 4);
        
        const blockX = gx * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2;
        const blockZ = gz * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2;
        
        let px, pz;
        switch(side) {
            case 0: px = blockX + Math.random() * BLOCK_SIZE; pz = blockZ - SIDEWALK_WIDTH / 2; break;
            case 1: px = blockX + Math.random() * BLOCK_SIZE; pz = blockZ + BLOCK_SIZE + SIDEWALK_WIDTH / 2; break;
            case 2: px = blockX - SIDEWALK_WIDTH / 2; pz = blockZ + Math.random() * BLOCK_SIZE; break;
            case 3: px = blockX + BLOCK_SIZE + SIDEWALK_WIDTH / 2; pz = blockZ + Math.random() * BLOCK_SIZE; break;
        }
        
        createPalmTree(px, pz);
    }
}

function createPalmTree(x, z) {
    // Tronco curvado (segmentos)
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    let currentX = x, currentZ = z, currentY = 0.16;
    const lean = (Math.random() - 0.5) * 0.3;
    
    for (let s = 0; s < 6; s++) {
        const seg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15 - s * 0.01, 0.2 - s * 0.01, 1.2, 6),
            trunkMat
        );
        seg.position.set(currentX + lean * s * 0.3, currentY + 0.6, currentZ);
        seg.castShadow = true;
        scene.add(seg);
        currentY += 1.1;
    }
    
    // Hojas de palmera (planos verdes)
    const leafMat = new THREE.MeshLambertMaterial({ 
        color: 0x2e7d32, 
        side: THREE.DoubleSide 
    });
    
    for (let l = 0; l < 7; l++) {
        const leaf = new THREE.Mesh(
            new THREE.PlaneGeometry(3.5, 1),
            leafMat
        );
        leaf.position.set(
            currentX + lean * 6 * 0.3,
            currentY + 0.3,
            currentZ
        );
        leaf.rotation.y = (l / 7) * Math.PI * 2;
        leaf.rotation.z = -0.4;
        leaf.castShadow = true;
        scene.add(leaf);
    }
}

function createStreetLamps() {
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x616161 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
    
    for (let i = 0; i <= GRID; i += 2) {
        const pos = i * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2 - BLOCK_SIZE / 2 - ROAD_WIDTH / 2;
        
        // Farolas en esquinas
        [-1, 1].forEach(dir => {
            const lamp = new THREE.Group();
            
            // Poste
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5, 6), lampMat);
            pole.position.y = 2.5;
            pole.castShadow = true;
            lamp.add(pole);
            
            // Luz
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), lightMat);
            bulb.position.y = 5;
            lamp.add(bulb);
            
            lamp.position.set(pos + dir * (BLOCK_SIZE / 2 + ROAD_WIDTH / 2 + 1), 0.16, pos + BLOCK_SIZE / 2);
            scene.add(lamp);
        });
    }
}