// Sistema de Misiones - 100 Misiones
let currentMissionIndex = -1;

const missions = [
    // MISIONES PRINCIPALES (1-20)
    {
        id: 1,
        title: "Regreso a casa",
        description: "Vuelve a tu antigua casa en el barrio",
        target: { x: 50, y: 0, z: -100 },
        reward: 1000,
        type: "story"
    },
    {
        id: 2,
        title: "Encuentro con Carlos",
        description: "Encuentra a tu amigo Carlos en el mercado",
        target: { x: -75, y: 0, z: 50 },
        reward: 1500,
        type: "story"
    },
    {
        id: 3,
        title: "Primer trabajo",
        description: "Ve a la fábrica para conseguir un empleo",
        target: { x: 100, y: 0, z: 150 },
        reward: 2000,
        type: "story"
    },
    {
        id: 4,
        title: "La oferta",
        description: "Encuentra al misterioso hombre en la plaza",
        target: { x: -50, y: 0, z: 75 },
        reward: 2500,
        type: "story"
    },
    {
        id: 5,
        title: "Primera entrega",
        description: "Entrega el paquete en el almacén",
        target: { x: 125, y: 0, z: -50 },
        reward: 3000,
        type: "delivery"
    },
    {
        id: 6,
        title: "Vigilancia",
        description: "Observa el edificio sospechoso por 5 minutos",
        target: { x: -100, y: 0, z: -75 },
        reward: 3500,
        type: "surveillance"
    },
    {
        id: 7,
        title: "Persecución",
        description: "Persigue al coche sospechoso",
        target: { x: 150, y: 0, z: 100 },
        reward: 4000,
        type: "chase"
    },
    {
        id: 8,
        title: "Rescate",
        description: "Rescata al rehén en el almacén",
        target: { x: -75, y: 0, z: -125 },
        reward: 4500,
        type: "rescue"
    },
    {
        id: 9,
        title: "Robo",
        description: "Roba el vehículo del jefe",
        target: { x: 200, y: 0, z: -25 },
        reward: 5000,
        type: "theft"
    },
    {
        id: 10,
        title: "Limpieza",
        description: "Elimina a los testigos",
        target: { x: -125, y: 0, z: 125 },
        reward: 5500,
        type: "elimination"
    },
    // MISIONES SECUNDARIAS (11-50)
    {
        id: 11,
        title: "Carrera callejera",
        description: "Participa en una carrera ilegal",
        target: { x: 50, y: 0, z: 50 },
        reward: 6000,
        type: "race"
    },
    {
        id: 12,
        title: "Contrabando",
        description: "Transporta mercancía por el puerto",
        target: { x: -150, y: 0, z: -50 },
        reward: 6500,
        type: "smuggling"
    },
    {
        id: 13,
        title: "Protección",
        description: "Protege al empresario local",
        target: { x: 75, y: 0, z: -100 },
        reward: 7000,
        type: "protection"
    },
    {
        id: 14,
        title: "Extorsión",
        description: "Cobra la deuda del comerciante",
        target: { x: -50, y: 0, z: 150 },
        reward: 7500,
        type: "extortion"
    },
    {
        id: 15,
        title: "Sabotaje",
        description: "Sabotea la competencia",
        target: { x: 100, y: 0, z: 75 },
        reward: 8000,
        type: "sabotage"
    },
    // Continuación de misiones hasta 100...
    // (Se generan programáticamente para completar 100)
];

// Generar las 100 misiones completas
for (let i = 16; i <= 100; i++) {
    const types = ["delivery", "race", "chase", "rescue", "theft", "elimination", "smuggling", "protection", "extortion", "sabotage"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const titles = {
        "delivery": ["Entrega urgente", "Paquete misterioso", "Carga valiosa"],
        "race": ["Carrera nocturna", "Velocidad prohibida", "Ruta peligrosa"],
        "chase": ["Persecución urbana", "Fuga mortal", "Seguimiento"],
        "rescue": ["Rescate express", "Extracción", "Libertad"],
        "theft": ["Robo perfecto", "Hurto maestro", "Desaparición"],
        "elimination": ["Objetivo eliminado", "Limpieza total", "Silencio"],
        "smuggling": ["Ruta clandestina", "Carga oculta", "Transporte"],
        "protection": ["Escolta", "Seguridad total", "Blindaje"],
        "extortion": ["Cobro forzoso", "Deuda pendiente", "Presión"],
        "sabotage": ["Destrucción", "Fallo técnico", "Caos"]
    };
    
    const title = titles[type][Math.floor(Math.random() * 3)] + " #" + i;
    
    missions.push({
        id: i,
        title: title,
        description: "Completa la misión " + type + " número " + i,
        target: {
            x: (Math.random() - 0.5) * 400,
            y: 0,
            z: (Math.random() - 0.5) * 400
        },
        reward: 1000 + i * 500,
        type: type
    });
}

function startMission(index) {
    if (index < 0 || index >= missions.length) return;
    
    currentMissionIndex = index;
    currentMission = missions[index];
    
    // Crear marcador de misión
    createMissionMarker(currentMission.target);
    
    // Mostrar información de misión
    updateHUD();
    
    console.log("Misión iniciada:", currentMission.title);
}

function createMissionMarker(target) {
    // Eliminar marcador anterior si existe
    if (window.missionMarker) {
        scene.remove(window.missionMarker);
    }
    
    // Crear nuevo marcador (esfera brillante)
    const markerGeom = new THREE.SphereGeometry(3, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700,
        transparent: true,
        opacity: 0.8
    });
    const marker = new THREE.Mesh(markerGeom, markerMat);
    marker.position.set(target.x, target.y + 3, target.z);
    scene.add(marker);
    
    // Anillo de luz
    const ringGeom = new THREE.RingGeometry(3, 4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(target.x, target.y + 0.5, target.z);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    
    window.missionMarker = marker;
    window.missionRing = ring;
}

function checkMissionCompletion() {
    if (!currentMission || !player) return;
    
    const distance = player.position.distanceTo(new THREE.Vector3(
        currentMission.target.x,
        currentMission.target.y,
        currentMission.target.z
    ));
    
    if (distance < 5) {
        completeMission();
    }
}

function completeMission() {
    // Recompensa
    money += currentMission.reward;
    missionsCompleted.push(currentMission.id);
    
    // Eliminar marcador
    if (window.missionMarker) {
        scene.remove(window.missionMarker);
        window.missionMarker = null;
    }
    if (window.missionRing) {
        scene.remove(window.missionRing);
        window.missionRing = null;
    }
    
    // Mostrar mensaje de completado
    alert("¡Misión completada!\nRecompensa: $" + currentMission.reward);
    
    // Siguiente misión
    currentMission = null;
    currentMissionIndex = -1;
    
    // Actualizar HUD
    updateHUD();
    
    // Guardar progreso
    saveProgress();
}

function saveProgress() {
    const saveData = {
        money: money,
        health: health,
        completedMissions: missionsCompleted,
        currentMissionIndex: currentMissionIndex
    };
    localStorage.setItem('colombia_gta_save', JSON.stringify(saveData));
}

function loadProgress() {
    const saveData = JSON.parse(localStorage.getItem('colombia_gta_save'));
    if (saveData) {
        money = saveData.money || 0;
        health = saveData.health || 100;
        missionsCompleted = saveData.completedMissions || [];
        currentMissionIndex = saveData.currentMissionIndex || -1;
        
        if (currentMissionIndex >= 0) {
            startMission(currentMissionIndex);
        }
    }
}

// Verificar completación de misión en el bucle principal
setInterval(checkMissionCompletion, 100);