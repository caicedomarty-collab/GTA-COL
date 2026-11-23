// Jugador estilo Tommy Vercetti + Vehículos + Peatones
function initPlayer() {
    playerGroup = new THREE.Group();
    
    // Piernas (pantalones vaqueros azules)
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), legMat);
    legL.position.set(-0.2, 0.45, 0);
    legL.castShadow = true;
    playerGroup.add(legL);
    
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), legMat);
    legR.position.set(0.2, 0.45, 0);
    legR.castShadow = true;
    playerGroup.add(legR);
    
    // Torso (camisa hawaiana verde estilo Tommy Vercetti)
    const torsoMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.45), torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    playerGroup.add(torso);
    
    // Estampado de la camisa (flores - planos pequeños)
    const flowerMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    for (let i = 0; i < 4; i++) {
        const flower = new THREE.Mesh(new THREE.CircleGeometry(0.08, 6), flowerMat);
        flower.position.set((Math.random() - 0.5) * 0.5, 1.2 + Math.random() * 0.5, 0.23);
        playerGroup.add(flower);
    }
    
    // Brazos (piel)
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), skinMat);
    armL.position.set(-0.55, 1.3, 0);
    armL.castShadow = true;
    playerGroup.add(armL);
    
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), skinMat);
    armR.position.set(0.55, 1.3, 0);
    armR.castShadow = true;
    playerGroup.add(armR);
    
    // Cabeza (piel + cabello oscuro)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    head.position.y = 2.1;
    head.castShadow = true;
    playerGroup.add(head);
    
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.52), hairMat);
    hair.position.y = 2.4;
    playerGroup.add(hair);
    
    // Guardar partes para animación
    playerGroup.userData = { legL, legR, armL, armR };
    
    playerGroup.position.set(0, 0.16, 0);
    scene.add(playerGroup);
    player = playerGroup.position;
}

function updatePlayer(delta) {
    if (!playerGroup) return;
    
    const speed = keys['ShiftLeft'] ? 8 : 4.5;
    const rotSpeed = 2.5;
    let moving = false;
    
    // Rotación
    if (keys['KeyA']) {
        playerGroup.rotation.y += rotSpeed * delta;
        moving = true;
    }
    if (keys['KeyD']) {
        playerGroup.rotation.y -= rotSpeed * delta;
        moving = true;
    }
    
    // Movimiento hacia adelante/atrás (dirección de la cámara)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(playerGroup.quaternion);
    
    if (keys['KeyW']) {
        playerGroup.position.addScaledVector(forward, speed * delta);
        moving = true;
    }
    if (keys['KeyS']) {
        playerGroup.position.addScaledVector(forward, -speed * delta);
        moving = true;
    }
    
    // Saltar
    if (keys['Space'] && playerGroup.position.y <= 0.17) {
        playerGroup.userData.vy = 6;
    }
    
    // Gravedad
    if (playerGroup.userData.vy !== undefined) {
        playerGroup.position.y += playerGroup.userData.vy * delta;
        playerGroup.userData.vy -= 15 * delta;
        if (playerGroup.position.y < 0.16) {
            playerGroup.position.y = 0.16;
            playerGroup.userData.vy = 0;
        }
    }
    
    // Animación de caminar (balanceo de brazos y piernas)
    const t = clock.elapsedTime;
    const { legL, legR, armL, armR } = playerGroup.userData;
    
    if (moving) {
        const swing = Math.sin(t * 10) * 0.5;
        legL.rotation.x = swing;
        legR.rotation.x = -swing;
        armL.rotation.x = -swing * 0.7;
        armR.rotation.x = swing * 0.7;
    } else {
        legL.rotation.x *= 0.9;
        legR.rotation.x *= 0.9;
        armL.rotation.x *= 0.9;
        armR.rotation.x *= 0.9;
    }
    
    // Límites de la ciudad
    const limit = CITY_SIZE / 2;
    playerGroup.position.x = Math.max(-limit, Math.min(limit, playerGroup.position.x));
    playerGroup.position.z = Math.max(-limit, Math.min(limit, playerGroup.position.z));
}

function initVehicles() {
    const carColors = [0xc62828, 0x1565c0, 0x2e7d32, 0xf9a825, 0x6a1b9a, 0x00838f, 0xef6c00, 0x37474f];
    
    for (let i = 0; i < 20; i++) {
        // Colocar en calles
        const onHorizontal = Math.random() > 0.5;
        const roadIdx = Math.floor(Math.random() * (GRID + 1));
        const roadPos = roadIdx * (BLOCK_SIZE + ROAD_WIDTH) - CITY_SIZE / 2 + ROAD_WIDTH / 2 - BLOCK_SIZE / 2 - ROAD_WIDTH / 2;
        
        let x, z, rotY;
        if (onHorizontal) {
            x = (Math.random() - 0.5) * CITY_SIZE;
            z = roadPos + (Math.random() > 0.5 ? 3.5 : -3.5);
            rotY = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            x = roadPos + (Math.random() > 0.5 ? 3.5 : -3.5);
            z = (Math.random() - 0.5) * CITY_SIZE;
            rotY = Math.random() > 0.5 ? 0 : Math.PI;
        }
        
        const car = createCar(carColors[Math.floor(Math.random() * carColors.length)]);
        car.position.set(x, 0.16, z);
        car.rotation.y = rotY;
        car.userData.speed = 0;
        car.userData.maxSpeed = 10 + Math.random() * 8;
        car.userData.isPlayerCar = false;
        scene.add(car);
        vehicles.push(car);
    }
}

function createCar(color) {
    const car = new THREE.Group();
    
    // Cuerpo principal
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 4.2), bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    car.add(body);
    
    // Cabina
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2), cabinMat);
    cabin.position.set(0, 1.15, -0.3);
    cabin.castShadow = true;
    car.add(cabin);
    
    // Parabrisas
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.7 });
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.1), glassMat);
    windshield.position.set(0, 1.1, 0.8);
    windshield.rotation.x = -0.3;
    car.add(windshield);
    
    // Ruedas
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
    
    [[-1, 1.3], [1, 1.3], [-1, -1.3], [1, -1.3]].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, 0.35, wz);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        car.add(wheel);
    });
    
    // Faros delanteros
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });
    [-0.6, 0.6].forEach(hx => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), headlightMat);
        hl.position.set(hx, 0.6, 2.15);
        car.add(hl);
    });
    
    // Luces traseras
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    [-0.7, 0.7].forEach(hx => {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.1), taillightMat);
        tl.position.set(hx, 0.6, -2.15);
        car.add(tl);
    });
    
    return car;
}

let playerCar = null;

function tryEnterVehicle() {
    if (playerCar) {
        // Salir del vehículo
        playerGroup.visible = true;
        playerGroup.position.set(
            playerCar.position.x + 2.5,
            0.16,
            playerCar.position.z
        );
        playerCar.userData.isPlayerCar = false;
        playerCar = null;
        return;
    }
    
    // Buscar vehículo cercano
    for (let car of vehicles) {
        const dist = playerGroup.position.distanceTo(car.position);
        if (dist < 5 && !car.userData.isPlayerCar) {
            car.userData.isPlayerCar = true;
            playerCar = car;
            playerGroup.visible = false;
            break;
        }
    }
}

function updateVehicles(delta) {
    vehicles.forEach(car => {
        if (car.userData.isPlayerCar && playerCar === car) {
            // Control del vehículo del jugador
            const speed = car.userData.speed || 0;
            
            if (keys['KeyW']) car.userData.speed = Math.min(speed + 15 * delta, car.userData.maxSpeed);
            else if (keys['KeyS']) car.userData.speed = Math.max(speed - 25 * delta, -8);
            else car.userData.speed = speed * 0.98;
            
            if (Math.abs(car.userData.speed) > 0.5) {
                if (keys['KeyA']) car.rotation.y += 2 * delta * (car.userData.speed > 0 ? 1 : -1);
                if (keys['KeyD']) car.rotation.y -= 2 * delta * (car.userData.speed > 0 ? 1 : -1);
            }
            
            // Mover
            const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion);
            car.position.addScaledVector(dir, car.userData.speed * delta);
            
            // Límites
            const limit = CITY_SIZE / 2;
            car.position.x = Math.max(-limit, Math.min(limit, car.position.x));
            car.position.z = Math.max(-limit, Math.min(limit, car.position.z));
            
            // Daño por chocar fuerte
            if (Math.abs(car.userData.speed) > 12 && (car.position.x <= -limit + 1 || car.position.x >= limit - 1 || car.position.z <= -limit + 1 || car.position.z >= limit - 1)) {
                health = Math.max(0, health - 10);
                car.userData.speed *= -0.3;
            }
        } else {
            // Tráfico IA - moverse por las calles
            const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion);
            car.position.addScaledVector(dir, 6 * delta);
            
            // Mantener en calles (wrap)
            const limit = CITY_SIZE / 2;
            if (car.position.x > limit) car.position.x = -limit;
            if (car.position.x < -limit) car.position.x = limit;
            if (car.position.z > limit) car.position.z = -limit;
            if (car.position.z < -limit) car.position.z = limit;
        }
    });
    
    // Si el jugador está en carro, seguirlo
    if (playerCar) {
        playerGroup.position.copy(playerCar.position);
    }
}

function initPedestrians() {
    const shirtColors = [0xe53935, 0x8e24aa, 0x3949ab, 0x00897b, 0xfdd835, 0xfb8c00];
    const pantsColors = [0x37474f, 0x5d4037, 0x1565c0, 0x212121];
    
    for (let i = 0; i < 30; i++) {
        const ped = new THREE.Group();
        
        // Piernas
        const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColors[Math.floor(Math.random() * pantsColors.length)] });
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), pantsMat);
        legL.position.set(-0.15, 0.35, 0);
        ped.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), pantsMat);
        legR.position.set(0.15, 0.35, 0);
        ped.add(legR);
        
        // Torso
        const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColors[Math.floor(Math.random() * shirtColors.length)] });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.35), shirtMat);
        torso.position.y = 1.05;
        torso.castShadow = true;
        ped.add(torso);
        
        // Cabeza
        const skinTones = [0xd4a574, 0x8d6e63, 0x5d4037, 0xf5cba7];
        const skinMat = new THREE.MeshLambertMaterial({ color: skinTones[Math.floor(Math.random() * skinTones.length)] });
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skinMat);
        head.position.y = 1.65;
        head.castShadow = true;
        ped.add(head);
        
        // Brazos
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), skinMat);
        armL.position.set(-0.42, 1.05, 0);
        ped.add(armL);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), skinMat);
        armR.position.set(0.42, 1.05, 0);
        ped.add(armR);
        
        ped.userData = { legL, legR, armL, armR, speed: 1.5 + Math.random() * 2, angle: Math.random() * Math.PI * 2 };
        
        // Colocar en aceras
        const limit = CITY_SIZE / 2 - 10;
        ped.position.set(
            (Math.random() - 0.5) * limit * 2,
            0.16,
            (Math.random() - 0.5) * limit * 2
        );
        
        ped.rotation.y = Math.random() * Math.PI * 2;
        ped.castShadow = true;
        scene.add(ped);
        pedestrians.push(ped);
    }
}

function updatePedestrians(delta) {
    const t = clock.elapsedTime;
    
    pedestrians.forEach(ped => {
        const ud = ped.userData;
        
        // Caminar
        const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(ped.quaternion);
        ped.position.addScaledVector(dir, ud.speed * delta);
        
        // Cambiar dirección aleatoriamente
        if (Math.random() < 0.01) {
            ped.rotation.y += (Math.random() - 0.5) * 2;
        }
        
        // Límites
        const limit = CITY_SIZE / 2 - 5;
        if (Math.abs(ped.position.x) > limit || Math.abs(ped.position.z) > limit) {
            ped.rotation.y += Math.PI;
            ped.position.x = Math.max(-limit, Math.min(limit, ped.position.x));
            ped.position.z = Math.max(-limit, Math.min(limit, ped.position.z));
        }
        
        // Animación de caminar
        const swing = Math.sin(t * 8 + ud.angle) * 0.4;
        ud.legL.rotation.x = swing;
        ud.legR.rotation.x = -swing;
        ud.armL.rotation.x = -swing * 0.6;
        ud.armR.rotation.x = swing * 0.6;
    });
}