// Motor Principal del Juego - Three.js
let scene, camera, renderer;
let player, playerMesh;
let vehicles = [];
let keys = {};
let gameState = 'loading';
let money = 0;
let health = 100;
let currentMission = null;
let missionsCompleted = [];

// Inicializar el juego
function initGame() {
    // Escena 3D
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Cielo azul
    scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Suelo
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Inicializar jugador
    initPlayer();

    // Inicializar ciudad
    initCity();

    // Inicializar vehículos
    initVehicles();

    // Eventos
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Ocultar pantalla de carga
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('menu').style.display = 'flex';
    }, 2000);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    keys[event.code] = true;
    
    if (event.code === 'KeyE') {
        tryEnterVehicle();
    }
    
    if (event.code === 'KeyM') {
        toggleMissionsPanel();
    }
}

function onKeyUp(event) {
    keys[event.code] = false;
}

// Bucle principal del juego
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'playing') {
        updatePlayer();
        updateCamera();
        updateVehicles();
        updateMinimap();
    }
    
    renderer.render(scene, camera);
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    gameState = 'playing';
    
    // Iniciar primera misión
    startMission(0);
}

function updateCamera() {
    if (player) {
        const targetPosition = new THREE.Vector3(
            player.position.x,
            player.position.y + 5,
            player.position.z + 10
        );
        
        camera.position.lerp(targetPosition, 0.1);
        camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
    }
}

function updateMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpiar minimapa
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    
    // Dibujar jugador
    if (player) {
        const playerX = (player.position.x / 1000) * 200 + 100;
        const playerY = (player.position.z / 1000) * 200 + 100;
        
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Dibujar misión actual
    if (currentMission) {
        const missionX = (currentMission.target.x / 1000) * 200 + 100;
        const missionY = (currentMission.target.z / 1000) * 200 + 100;
        
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(missionX, missionY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Dibujar vehículos
    vehicles.forEach(vehicle => {
        const vehicleX = (vehicle.position.x / 1000) * 200 + 100;
        const vehicleY = (vehicle.position.z / 1000) * 200 + 100;
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(vehicleX - 2, vehicleY - 2, 4, 4);
    });
}

// Inicializar cuando se carga la página
window.onload = function() {
    initGame();
    animate();
};