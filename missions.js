// 100 Misiones estilo GTA
let currentMission = null;
let currentMissionIndex = -1;
let missionMarker = null;
let missionBeam = null;

const missions = [
    // HISTORIA PRINCIPAL (1-20)
    { id: 1, title: "Regreso a casa", description: "Vuelve a tu casa en el barrio", target: { x: 60, z: -80 }, reward: 1000 },
    { id: 2, title: "Encuentro con Carlos", description: "Encuentra a tu amigo en el mercado", target: { x: -70, z: 45 }, reward: 1500 },
    { id: 3, title: "Primer trabajo", description: "Ve a la fábrica para conseguir empleo", target: { x: 90, z: 120 }, reward: 2000 },
    { id: 4, title: "La oferta misteriosa", description: "Encuentra al hombre en la plaza", target: { x: -40, z: 70 }, reward: 2500 },
    { id: 5, title: "Primera entrega", description: "Entrega el paquete en el almacén", target: { x: 110, z: -50 }, reward: 3000 },
    { id: 6, title: "Vigilancia", description: "Observa el edificio sospechoso", target: { x: -95, z: -70 }, reward: 3500 },
    { id: 7, title: "Persecución urbana", description: "Persigue al coche sospechoso", target: { x: 130, z: 95 }, reward: 4000 },
    { id: 8, title: "Rescate express", description: "Rescata al rehén en el almacén", target: { x: -70, z: -115 }, reward: 4500 },
    { id: 9, title: "Robo perfecto", description: "Roba el vehículo del jefe", target: { x: 175, z: -30 }, reward: 5000 },
    { id: 10, title: "Limpieza total", description: "Despídete de los testigos", target: { x: -120, z: 110 }, reward: 5500 },
    { id: 11, title: "Carrera nocturna", description: "Participa en una carrera ilegal", target: { x: 45, z: 55 }, reward: 6000 },
    { id: 12, title: "Contrabando", description: "Transporta mercancía por el puerto", target: { x: -140, z: -45 }, reward: 6500 },
    { id: 13, title: "Protección total", description: "Protege al empresario local", target: { x: 70, z: -95 }, reward: 7000 },
    { id: 14, title: "Cobro forzoso", description: "Cobra la deuda del comerciante", target: { x: -45, z: 135 }, reward: 7500 },
    { id: 15, title: "Sabotaje", description: "Sabotea a la competencia", target: { x: 95, z: 70 }, reward: 8000 },
    { id: 16, title: "Fuga mortal", description: "Escapa de la policía", target: { x: -85, z: -35 }, reward: 8500 },
    { id: 17, title: "Carga oculta", description: "Transporta algo especial", target: { x: 55, z: 145 }, reward: 9000 },
    { id: 18, title: "Escolta", description: "Escolta al político", target: { x: -110, z: 85 }, reward: 9500 },
    { id: 19, title: "Deuda pendiente", description: "Cobra la última deuda", target: { x: 140, z: -105 }, reward: 10000 },
    { id: 20, title: "El gran golpe", description: "El atraco final al banco", target: { x: 0, z: 0 }, reward: 15000 },
    
    // MISIONES SECUNDARIAS (21-100)
    { id: 21, title: "Entrega urgente #1", description: "Entrega paquete rápido", target: { x: 80, z: 60 }, reward: 5000 },
    { id: 22, title: "Ruta peligrosa", description: "Sigue la ruta marcada", target: { x: -60, z: -90 }, reward: 5500 },
    { id: 23, title: "Velocidad prohibida", description: "Llega antes de tiempo", target: { x: 150, z: 40 }, reward: 6000 },
    { id: 24, title: "Seguimiento", description: "Sigue al sospechoso", target: { x: -130, z: 100 }, reward: 6500 },
    { id: 25, title: "Extracción", description: "Extrae al objetivo", target: { x: 35, z: -130 }, reward: 7000 },
    { id: 26, title: "Hurto maestro", description: "Roba sin dejar rastro", target: { x: -75, z: 55 }, reward: 7500 },
    { id: 27, title: "Silencio", description: "Elimina discretamente", target: { x: 120, z: -75 }, reward: 8000 },
    { id: 28, title: "Ruta clandestina", description: "Sigue la ruta oculta", target: { x: -100, z: -55 }, reward: 8500 },
    { id: 29, title: "Blindaje", description: "Protege la carga", target: { x: 65, z: 125 }, reward: 9000 },
    { id: 30, title: "Presión", description: "Aplica presión", target: { x: -55, z: -120 }, reward: 9500 },
    { id: 31, title: "Destrucción", description: "Destruye el objetivo", target: { x: 160, z: 85 }, reward: 10000 },
    { id: 32, title: "Paquete misterioso", description: "Recoge el paquete", target: { x: -40, z: 35 }, reward: 5000 },
    { id: 33, title: "Carrera urbana", description: "Gana la carrera", target: { x: 100, z: -40 }, reward: 5500 },
    { id: 34, title: "Perfil bajo", description: "Mantente desapercibido", target: { x: -115, z: 75 }, reward: 6000 },
    { id: 35, title: "Rescate rápido", description: "Rescata antes de tiempo", target: { x: 45, z: -100 }, reward: 6500 },
    { id: 36, title: "Vehículo buscado", description: "Recupera el vehículo", target: { x: -90, z: 140 }, reward: 7000 },
    { id: 37, title: "Objetivo eliminado", description: "Completa el trabajo", target: { x: 135, z: -65 }, reward: 7500 },
    { id: 38, title: "Transporte especial", description: "Transporta con cuidado", target: { x: -65, z: -85 }, reward: 8000 },
    { id: 39, title: "Seguridad total", description: "Asegura la zona", target: { x: 85, z: 105 }, reward: 8500 },
    { id: 40, title: "Último aviso", description: "Da el último aviso", target: { x: -125, z: -45 }, reward: 9000 },
    { id: 41, title: "Fallo técnico", description: "Causa el fallo", target: { x: 55, z: 155 }, reward: 9500 },
    { id: 42, title: "Entrega #2", description: "Segunda entrega", target: { x: -80, z: 65 }, reward: 5000 },
    { id: 43, title: "Nocturna", description: "Trabajo nocturno", target: { x: 115, z: -110 }, reward: 5500 },
    { id: 44, title: "Escolta urbana", description: "Escolta por la ciudad", target: { x: -45, z: 95 }, reward: 6000 },
    { id: 45, title: "Robo exprés", description: "Robo rápido", target: { x: 75, z: -55 }, reward: 6500 },
    { id: 46, title: "Limpieza #2", description: "Segunda limpieza", target: { x: -105, z: 130 }, reward: 7000 },
    { id: 47, title: "Contrabando #2", description: "Segundo contrabando", target: { x: 145, z: 50 }, reward: 7500 },
    { id: 48, title: "Protección #2", description: "Segunda protección", target: { x: -35, z: -75 }, reward: 8000 },
    { id: 49, title: "Extorsión #2", description: "Segunda extorsión", target: { x: 65, z: 145 }, reward: 8500 },
    { id: 50, title: "Sabotaje #2", description: "Segundo sabotaje", target: { x: -140, z: -30 }, reward: 9000 },
    { id: 51, title: "Caza de recompensa", description: "Captura al objetivo", target: { x: 95, z: -125 }, reward: 9500 },
    { id: 52, title: "Operación limpia", description: "Opera sin testigos", target: { x: -70, z: 45 }, reward: 10000 },
    { id: 53, title: "Carga valiosa", description: "Protege la carga valiosa", target: { x: 125, z: 85 }, reward: 5500 },
    { id: 54, title: "Persecución #2", description: "Segunda persecución", target: { x: -55, z: -115 }, reward: 6000 },
    { id: 55, title: "Rescate #3", description: "Tercer rescate", target: { x: 40, z: 65 }, reward: 6500 },
    { id: 56, title: "Hurto exprés", description: "Hurto muy rápido", target: { x: -120, z: -65 }, reward: 7000 },
    { id: 57, title: "Objetivo #3", description: "Tercer objetivo", target: { x: 155, z: 115 }, reward: 7500 },
    { id: 58, title: "Ruta #3", description: "Tercera ruta", target: { x: -85, z: 35 }, reward: 8000 },
    { id: 59, title: "Blindaje #2", description: "Segundo blindaje", target: { x: 70, z: -95 }, reward: 8500 },
    { id: 60, title: "Presión #2", description: "Segunda presión", target: { x: -145, z: 75 }, reward: 9000 },
    { id: 61, title: "Caos controlado", description: "Causa caos controlado", target: { x: 50, z: -145 }, reward: 9500 },
    { id: 62, title: "Entrega #3", description: "Tercera entrega", target: { x: -60, z: 105 }, reward: 5000 },
    { id: 63, title: "Carrera #2", description: "Segunda carrera", target: { x: 105, z: -35 }, reward: 5500 },
    { id: 64, title: "Vigilancia #2", description: "Segunda vigilancia", target: { x: -95, z: -85 }, reward: 6000 },
    { id: 65, title: "Extracción #2", description: "Segunda extracción", target: { x: 135, z: 55 }, reward: 6500 },
    { id: 66, title: "Robo #3", description: "Tercer robo", target: { x: -40, z: -135 }, reward: 7000 },
    { id: 67, title: "Eliminación #3", description: "Tercera eliminación", target: { x: 85, z: 95 }, reward: 7500 },
    { id: 68, title: "Contrabando #3", description: "Tercer contrabando", target: { x: -130, z: -55 }, reward: 8000 },
    { id: 69, title: "Escolta #3", description: "Tercera escolta", target: { x: 60, z: 155 }, reward: 8500 },
    { id: 70, title: "Extorsión #3", description: "Tercera extorsión", target: { x: -75, z: 25 }, reward: 9000 },
    { id: 71, title: "Sabotaje #3", description: "Tercer sabotaje", target: { x: 145, z: -105 }, reward: 9500 },
    { id: 72, title: "Fuga #2", description: "Segunda fuga", target: { x: -110, z: 65 }, reward: 10000 },
    { id: 73, title: "Transporte #4", description: "Cuarto transporte", target: { x: 45, z: -75 }, reward: 5500 },
    { id: 74, title: "Seguridad #3", description: "Tercera seguridad", target: { x: -50, z: 125 }, reward: 6000 },
    { id: 75, title: "Aviso final", description: "Último aviso", target: { x: 115, z: -45 }, reward: 6500 },
    { id: 76, title: "Fallo #2", description: "Segundo fallo", target: { x: -85, z: -105 }, reward: 7000 },
    { id: 77, title: "Entrega #4", description: "Cuarta entrega", target: { x: 75, z: 75 }, reward: 7500 },
    { id: 78, title: "Persecución #3", description: "Tercera persecución", target: { x: -135, z: -25 }, reward: 8000 },
    { id: 79, title: "Rescate #4", description: "Cuarto rescate", target: { x: 95, z: 145 }, reward: 8500 },
    { id: 80, title: "Robo #4", description: "Cuarto robo", target: { x: -65, z: -55 }, reward: 9000 },
    { id: 81, title: "Limpieza #3", description: "Tercera limpieza", target: { x: 155, z: 35 }, reward: 9500 },
    { id: 82, title: "Contrabando #4", description: "Cuarto contrabando", target: { x: -45, z: -125 }, reward: 10000 },
    { id: 83, title: "Protección #4", description: "Cuarta protección", target: { x: 65, z: 55 }, reward: 5500 },
    { id: 84, title: "Extorsión #4", description: "Cuarta extorsión", target: { x: -115, z: 95 }, reward: 6000 },
    { id: 85, title: "Sabotaje #4", description: "Cuarto sabotaje", target: { x: 40, z: -155 }, reward: 6500 },
    { id: 86, title: "Fuga #3", description: "Tercera fuga", target: { x: -70, z: 45 }, reward: 7000 },
    { id: 87, title: "Carga #5", description: "Quinta carga", target: { x: 125, z: -85 }, reward: 7500 },
    { id: 88, title: "Escolta #4", description: "Cuarta escolta", target: { x: -90, z: 145 }, reward: 8000 },
    { id: 89, title: "Robo #5", description: "Quinto robo", target: { x: 55, z: -35 }, reward: 8500 },
    { id: 90, title: "Objetivo #5", description: "Quinto objetivo", target: { x: -140, z: 85 }, reward: 9000 },
    { id: 91, title: "Ruta #5", description: "Quinta ruta", target: { x: 85, z: -115 }, reward: 9500 },
    { id: 92, title: "Blindaje #3", description: "Tercer blindaje", target: { x: -55, z: 65 }, reward: 10000 },
    { id: 93, title: "Presión #3", description: "Tercera presión", target: { x: 145, z: -55 }, reward: 5500 },
    { id: 94, title: "Caos #2", description: "Segundo caos", target: { x: -80, z: -145 }, reward: 6000 },
    { id: 95, title: "Entrega #5", description: "Quinta entrega", target: { x: 70, z: 115 }, reward: 6500 },
    { id: 96, title: "Carrera final", description: "Última carrera", target: { x: -125, z: -75 }, reward: 7000 },
    { id: 97, title: "Vigilancia final", description: "Última vigilancia", target: { x: 110, z: 45 }, reward: 7500 },
    { id: 98, title: "Rescate final", description: "Último rescate", target: { x: -40, z: -95 }, reward: 8000 },
    { id: 99, title: "Trabajo final", description: "Último trabajo", target: { x: 160, z: 135 }, reward: 8500 },
    { id: 100, title: "El retiro", description: "Última misión: retírate", target: { x: 0, z: 0 }, reward: 50000 }
];

function startMission(index) {
    if (index < 0 || index >= missions.length) return;
    
    // Limpiar marcador anterior
    if (missionMarker) scene.remove(missionMarker);
    if (missionBeam) scene.remove(missionBeam);
    
    currentMissionIndex = index;
    currentMission = missions[index];
    
    // Crear marcador de misión (columna de luz dorada)
    const markerGeo = new THREE.CylinderGeometry(2, 2, 30, 16, 1, true);
    const markerMat = new THREE.MeshBasicMaterial({
        color: 0xffd93d,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
    });
    missionMarker = new THREE.Mesh(markerGeo, markerMat);
    missionMarker.position.set(currentMission.target.x, 15, currentMission.target.z);
    scene.add(missionMarker);
    
    // Anillo en el suelo
    const ringGeo = new THREE.RingGeometry(1.8, 2.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffd93d,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    missionBeam = new THREE.Mesh(ringGeo, ringMat);
    missionBeam.rotation.x = -Math.PI / 2;
    missionBeam.position.set(currentMission.target.x, 0.3, currentMission.target.z);
    scene.add(missionBeam);
    
    updateHUD();
    console.log('Misión iniciada:', currentMission.title);
}

function checkMissionCompletion() {
    if (!currentMission || !playerGroup) return;
    
    const target = new THREE.Vector3(currentMission.target.x, 0, currentMission.target.z);
    const dist = playerGroup.position.distanceTo(target);
    
    if (dist < 5) {
        completeMission();
    }
    
    // Animar marcador
    if (missionMarker) {
        missionMarker.rotation.y += 0.02;
        missionMarker.material.opacity = 0.25 + Math.sin(clock.elapsedTime * 3) * 0.1;
    }
    if (missionBeam) {
        missionBeam.rotation.z += 0.03;
    }
}

function completeMission() {
    money += currentMission.reward;
    missionsCompleted.push(currentMission.id);
    
    // Eliminar marcador
    if (missionMarker) { scene.remove(missionMarker); missionMarker = null; }
    if (missionBeam) { scene.remove(missionBeam); missionBeam = null; }
    
    // Feedback visual
    alert('¡MISIÓN COMPLETADA!\n\n' + currentMission.title + '\nRecompensa: $' + currentMission.reward.toLocaleString());
    
    currentMission = null;
    currentMissionIndex = -1;
    
    // Siguiente misión automáticamente
    const nextIdx = missions.findIndex(m => !missionsCompleted.includes(m.id));
    if (nextIdx >= 0) {
        setTimeout(() => startMission(nextIdx), 500);
    }
    
    // Guardar progreso
    saveProgress();
    updateHUD();
}

function saveProgress() {
    const data = {
        money, health, armor, wantedLevel,
        completed: missionsCompleted,
        missionIndex: currentMissionIndex
    };
    localStorage.setItem('colombia_gta_save', JSON.stringify(data));
}

function loadProgress() {
    const data = JSON.parse(localStorage.getItem('colombia_gta_save'));
    if (data) {
        money = data.money || 500;
        health = data.health || 100;
        armor = data.armor || 0;
        wantedLevel = data.wantedLevel || 0;
        missionsCompleted = data.completed || [];
        
        const nextIdx = missions.findIndex(m => !missionsCompleted.includes(m.id));
        if (nextIdx >= 0 && gameState === 'playing') {
            startMission(nextIdx);
        }
    }
}