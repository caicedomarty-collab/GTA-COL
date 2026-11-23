// Jugador y Vehículos
function initPlayer() {
    // Crear personaje (cubo simple con brazos y piernas)
    player = new THREE.Group();
    
    // Cuerpo
    const bodyGeom = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 }); // Camisa amarilla
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1;
    player.add(body);

    // Cabeza
    const headGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xDEB887 }); // Piel
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 2;
    player.add(head);

    // Brazos
    const armGeom = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const armMat = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
    
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.7, 1, 0);
    player.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.7, 1, 0);
    player.add(rightArm);

    // Piernas
    const legGeom = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x000080 }); // Jeans azules
    
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.3, 0.4, 0);
    player.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.3, 0.4, 0);
    player.add(rightLeg);

    player.position.set(0, 0, 0);
    player.castShadow = true;
    scene.add(player);
    playerMesh = player;
}

function initVehicles() {
    // Crear varios vehículos (autos simples)
    const vehicleColors = [
        0xFF0000, // Rojo
        0x0000FF, // Azul
        0x00FF00, // Verde
        0xFFFF00, // Amarillo
        0xFF00FF, // Magenta
        0x00FFFF, // Cian
        0xFF8C00, // Naranja
        0x8B4513  // Marrón
    ];

    for (let i = 0; i < 15; i++) {
        const vehicle = createVehicle(
            vehicleColors[Math.floor(Math.random() * vehicleColors.length)],
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400
        );
        vehicles.push(vehicle);
    }
}

function createVehicle(color, x, z) {
    const vehicle = new THREE.Group();
    
    // Cuerpo del auto
    const bodyGeom = new THREE.BoxGeometry(4, 1.5, 2);
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1;
    vehicle.add(body);

    // Cabina
    const cabinGeom = new THREE.BoxGeometry(2, 1, 1.8);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(0, 2, 0);
    vehicle.add(cabin);

    // Ruedas
    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const positions = [
        [-1.5, 0.4, 1],
        [1.5, 0.4, 1],
        [-1.5, 0.4, -1],
        [1.5, 0.4, -1]
    ];
    
    positions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeom, wheelMat);
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        vehicle.add(wheel);
    });

    vehicle.position.set(x, 0, z);
    vehicle.castShadow = true;
    vehicle.receiveShadow = true;
    scene.add(vehicle);
    
    return vehicle;
}

function updatePlayer() {
    if (!player) return;
    
    const speed = 0.2;
    const rotationSpeed = 0.05;
    
    // Movimiento
    if (keys['KeyW']) {
        player.position.z -= speed;
        player.rotation.y = Math.PI;
    }
    if (keys['KeyS']) {
        player.position.z += speed;
        player.rotation.y = 0;
    }
    if (keys['KeyA']) {
        player.position.x -= speed;
        player.rotation.y = Math.PI / 2;
    }
    if (keys['KeyD']) {
        player.position.x += speed;
        player.rotation.y = -Math.PI / 2;
    }
    
    // Saltar
    if (keys['Space'] && player.position.y < 0.1) {
        player.position.y = 0.5;
    }
    
    // Gravedad
    if (player.position.y > 0) {
        player.position.y -= 0.02;
    }
    
    // Mantener dentro de los límites
    player.position.x = Math.max(-450, Math.min(450, player.position.x));
    player.position.z = Math.max(-450, Math.min(450, player.position.z));
    
    // Actualizar HUD
    updateHUD();
}

function updateVehicles() {
    vehicles.forEach(vehicle => {
        // Los vehículos se mueven aleatoriamente
        if (Math.random() < 0.01) {
            vehicle.rotation.y += (Math.random() - 0.5) * 0.5;
        }
        
        const moveSpeed = 0.1;
        vehicle.position.x += Math.sin(vehicle.rotation.y) * moveSpeed;
        vehicle.position.z += Math.cos(vehicle.rotation.y) * moveSpeed;
        
        // Mantener dentro de límites
        if (vehicle.position.x > 450) vehicle.position.x = -450;
        if (vehicle.position.x < -450) vehicle.position.x = 450;
        if (vehicle.position.z > 450) vehicle.position.z = -450;
        if (vehicle.position.z < -450) vehicle.position.z = 450;
    });
}

function tryEnterVehicle() {
    // Buscar vehículo cercano
    for (let vehicle of vehicles) {
        const distance = player.position.distanceTo(vehicle.position);
        if (distance < 5) {
            // Entrar al vehículo (simplificado - solo mostrar mensaje)
            console.log("¡Vehículo encontrado! (Función de manejo pendiente)");
            break;
        }
    }
}

function updateHUD() {
    // Actualizar dinero
    document.getElementById('money').textContent = '$' + money;
    
    // Actualizar salud
    document.getElementById('health-fill').style.width = health + '%';
    document.getElementById('health-text').textContent = health;
    
    // Actualizar misión actual
    if (currentMission) {
        document.getElementById('mission-title').textContent = currentMission.title;
        document.getElementById('mission-desc').textContent = currentMission.description;
    } else {
        document.getElementById('mission-title').textContent = 'Sin misión activa';
        document.getElementById('mission-desc').textContent = 'Presiona M para ver misiones disponibles';
    }
}

function toggleMissionsPanel() {
    const panel = document.getElementById('mission-panel');
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        updateMissionsList();
    } else {
        panel.style.display = 'none';
    }
}

function updateMissionsList() {
    const list = document.getElementById('missions-list');
    list.innerHTML = '';
    
    // Mostrar primeras 10 misiones
    for (let i = 0; i < Math.min(10, missions.length); i++) {
        const mission = missions[i];
        const div = document.createElement('div');
        div.className = 'mission-item' + (i === currentMissionIndex ? ' active' : '');
        
        div.innerHTML = `
            <h3>Misión ${mission.id}: ${mission.title}</h3>
            <p>${mission.description}</p>
        `;
        
        div.onclick = () => {
            if (i <= currentMissionIndex + 1) {
                startMission(i);
                document.getElementById('mission-panel').style.display = 'none';
            }
        };
        
        list.appendChild(div);
    }
}