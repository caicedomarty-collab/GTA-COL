// Motor Principal - Estilo GTA Vice City
let scene, camera, renderer;
let player, playerGroup;
let vehicles = [];
let pedestrians = [];
let keys = {};
let gameState = 'loading';
let money = 500;
let health = 100;
let armor = 0;
let wantedLevel = 0;
let currentMission = null;
let currentMissionIndex = -1;
let missionsCompleted = [];
let clock;

// Cámara en tercera persona estilo GTA
let cameraAngle = 0;
let cameraDistance = 8;
let cameraHeight = 4;

function initGame() {
    clock = new THREE.Clock();
    
    // Escena con cielo de atardecer estilo Vice City
    scene = new THREE.Scene();
    
    // Cielo degradado (atardecer tropical)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 32;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');
    const gradient = skyCtx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1a0a2e');      // Oscuro arriba
    gradient.addColorStop(0.4, '#ff6b9d');    // Rosa
    gradient.addColorStop(0.7, '#ffd93d');    // Dorado
    gradient.addColorStop(1, '#ff9a56');      // Naranja abajo
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, 32, 512);
    
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    scene.background = skyTexture;
    scene.fog = new THREE.Fog(0xff9a56, 60, 250);
    
    // Cámara tercera persona
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 5, 10);
    
    // Renderer optimizado
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Iluminación estilo atardecer
    const ambientLight = new THREE.AmbientLight(0xffb38a, 0.6);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffd93d, 1.0);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);
    
    // Luz de relleno rosa
    const fillLight = new THREE.DirectionalLight(0xff6b9d, 0.3);
    fillLight.position.set(-30, 40, -20);
    scene.add(fillLight);
    
    // Inicializar mundo
    initCity();
    initPlayer();
    initVehicles();
    initPedestrians();
    
    // Eventos
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    
    // Ocultar carga
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('menu').style.display = 'flex';
    }, 2200);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    keys[event.code] = true;
    if (event.code === 'KeyE') tryEnterVehicle();
    if (event.code === 'KeyM') toggleMissionsPanel();
}

function onKeyUp(event) {
    keys[event.code] = false;
}

let mouseX = 0;
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
}

// Cámara estilo GTA - detrás del personaje
function updateCamera() {
    if (!playerGroup) return;
    
    const target = playerGroup.position;
    
    // Rotación con mouse y teclas Q/E
    if (keys['KeyQ']) cameraAngle += 0.03;
    if (keys['KeyE'] && !keys['ShiftLeft']) cameraAngle -= 0.03;
    cameraAngle += mouseX * 0.001;
    
    const camX = target.x + Math.sin(cameraAngle) * cameraDistance;
    const camZ = target.z + Math.cos(cameraAngle) * cameraDistance;
    const camY = target.y + cameraHeight;
    
    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.08);
    camera.lookAt(target.x, target.y + 2, target.z);
}

// Minimapa circular estilo GTA
function updateMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    const ctx = canvas.getContext('2d');
    const size = 160;
    const center = size / 2;
    
    ctx.clearRect(0, 0, size, size);
    
    // Fondo del minimapa
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Recortar a círculo
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 3, 0, Math.PI * 2);
    ctx.clip();
    
    // Fondo del mundo
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, size, size);
    
    // Calles (líneas)
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 8;
    for (let i = -200; i <= 200; i += 80) {
        // Escalar posición del mundo al minimapa
        const wx = (i - playerGroup.position.x) * 0.3 + center;
        const wz = (i - playerGroup.position.z) * 0.3 + center;
        
        ctx.beginPath();
        ctx.moveTo(wx, 0);
        ctx.lineTo(wx, size);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, wz);
        ctx.lineTo(size, wz);
        ctx.stroke();
    }
    
    // Vehículos (puntos verdes)
    ctx.fillStyle = '#6bcb77';
    vehicles.forEach(v => {
        const vx = (v.position.x - playerGroup.position.x) * 0.3 + center;
        const vz = (v.position.z - playerGroup.position.z) * 0.3 + center;
        if (vx > 0 && vx < size && vz > 0 && vz < size) {
            ctx.fillRect(vx - 2, vz - 2, 4, 4);
        }
    });
    
    // Peatones (puntos blancos)
    ctx.fillStyle = '#fff';
    pedestrians.forEach(p => {
        const px = (p.position.x - playerGroup.position.x) * 0.3 + center;
        const pz = (p.position.z - playerGroup.position.z) * 0.3 + center;
        if (px > 0 && px < size && pz > 0 && pz < size) {
            ctx.fillRect(px - 1, pz - 1, 2, 2);
        }
    });
    
    // Misión (punto amarillo)
    if (currentMission) {
        const mx = (currentMission.target.x - playerGroup.position.x) * 0.3 + center;
        const mz = (currentMission.target.z - playerGroup.position.z) * 0.3 + center;
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath();
        ctx.arc(mx, mz, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    ctx.restore();
    
    // Dirección del jugador (triángulo en el centro)
    const playerAngle = playerGroup ? playerGroup.rotation.y : 0;
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-playerAngle);
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-5, 5);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function updateHUD() {
    document.getElementById('money-hud').textContent = '$' + money.toLocaleString();
    document.getElementById('health-fill-hud').style.width = health + '%';
    document.getElementById('armor-fill-hud').style.width = armor + '%';
    
    // Estrellas de búsqueda
    const stars = document.querySelectorAll('.wanted-star');
    stars.forEach((star, i) => {
        star.classList.toggle('active', i < wantedLevel);
    });
    
    if (currentMission) {
        document.getElementById('mission-title-hud').textContent = currentMission.title;
        document.getElementById('mission-desc-hud').textContent = currentMission.description;
    } else {
        document.getElementById('mission-title-hud').textContent = 'Sin misión';
        document.getElementById('mission-desc-hud').textContent = 'Presiona M para misiones';
    }
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    gameState = 'playing';
    startMission(0);
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
    
    for (let i = 0; i < Math.min(20, missions.length); i++) {
        const mission = missions[i];
        const div = document.createElement('div');
        div.className = 'mission-item' + 
            (i === currentMissionIndex ? ' active' : '') +
            (missionsCompleted.includes(mission.id) ? ' completed' : '');
        
        div.innerHTML = `<h3>${mission.id}. ${mission.title}</h3><p>${mission.description}</p>`;
        
        div.onclick = () => {
            if (i <= currentMissionIndex + 1 || missionsCompleted.includes(mission.id)) {
                startMission(i);
                document.getElementById('mission-panel').style.display = 'none';
            }
        };
        
        list.appendChild(div);
    }
}

// Bucle principal
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'playing') {
        const delta = clock.getDelta();
        updatePlayer(delta);
        updateCamera();
        updateVehicles(delta);
        updatePedestrians(delta);
        updateMinimap();
        updateHUD();
        checkMissionCompletion();
    }
    
    renderer.render(scene, camera);
}

window.onload = function() {
    initGame();
    animate();
};