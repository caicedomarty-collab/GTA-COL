// ============ 100 Misiones — con puntos múltiples ============
// Cada misión puede tener varios puntos (pts); el jugador debe pasar por ellos en orden.
let currentMission = null, currentMissionIndex = -1;
let missionMarker = null, missionRing = null;

function mk(id, title, desc, pts, reward) {
    return { id, title, desc, pts: pts.map(p => ({ x: p[0], z: p[1] })), reward };
}

const missions = [
    // --- HISTORIA (1-20) ---
    mk(1,  'Regreso a casa',       'Vuelve a tu casa en el barrio',                [[60, -80], [0, 30]], 1000),
    mk(2,  'Encuentro con Carlos','Encuentra a tu amigo en el mercado',           [[-70, 45]], 1500),
    mk(3,  'Primer trabajo',       'Ve a la fábrica a conseguir empleo',           [[90, 120]], 2000),
    mk(4,  'La oferta',            'Encuentra al hombre misterioso',              [[-40, 70], [110, -120]], 2500),
    mk(5,  'Primera entrega',      'Entrega el paquete en el almacén',            [[110, -50], [-130, 90]], 3000),
    mk(6,  'Vigilancia',           'Observa el edificio sospechoso',              [[-95, -70]], 3500),
    mk(7,  'Persecución',          'Persigue al coche sospechoso por la ciudad',  [[130, 95], [-140, -100], [45, 150]], 4000),
    mk(8,  'Rescate',              'Rescata al rehén en el almacén',              [[-70, -115], [60, 60]], 4500),
    mk(9,  'Robo perfecto',        'Roba el vehículo del jefe',                   [[175, -30]], 5000),
    mk(10, 'Limpieza',             'Despídete de los testigos',                   [[-120, 110], [80, -40]], 5500),
    mk(11, 'Carrera nocturna',     'Participa en una carrera ilegal',             [[45, 55], [-55, -130], [140, 40]], 6000),
    mk(12, 'Contrabando',          'Transporta mercancía por el puerto',          [[-140, -45], [WATER_X + 20, 60]], 6500),
    mk(13, 'Protección',           'Protege al empresario local',                 [[70, -95], [-90, 30]], 7000),
    mk(14, 'Cobro forzoso',        'Cobra la deuda del comerciante',              [[-45, 135], [120, -80]], 7500),
    mk(15, 'Sabotaje',             'Sabotea a la competencia',                    [[95, 70], [-110, -50]], 8000),
    mk(16, 'Fuga mortal',          'Escapa de la policía por las calles',         [[-85, -35], [130, 130], [-150, 60], [0, -140]], 8500),
    mk(17, 'Carga oculta',         'Transporta algo especial por la ciudad',      [[55, 145], [-145, -60]], 9000),
    mk(18, 'Escolta',              'Escolta al político hasta el palacio',        [[-110, 85], [30, -30]], 9500),
    mk(19, 'Deuda pendiente',      'Cobra la última deuda en la playa',           [[140, -105], [WATER_X + 30, -80]], 10000),
    mk(20, 'El gran golpe',        'EL ATRACO FINAL: entra al banco',             [[0, 0], [-45, 45], [180, 180]], 15000),

    // --- SECUNDARIAS (21-100) ---
    mk(21, 'Entrega urgente',   'Entrega el paquete rápido',            [[80, 60], [-80, -60]], 5000),
    mk(22, 'Ruta peligrosa',   'Sigue la ruta marcada',                [[-60, -90], [90, 30], [-30, 140]], 5500),
    mk(23, 'Velocidad prohibida', 'Llega antes de tiempo',             [[150, 40], [-150, -40]], 6000),
    mk(24, 'Seguimiento',      'Sigue al sospechoso',                  [[-130, 100], [50, -100]], 6500),
    mk(25, 'Extracción',       'Extrae al objetivo del hotel',         [[35, -130], [120, 60]], 7000),
    mk(26, 'Hurto maestro',    'Roba sin dejar rastro',                [[-75, 55]], 7500),
    mk(27, 'Silencio',         'Elimina discretamente en el mercado',  [[120, -75]], 8000),
    mk(28, 'Ruta clandestina', 'Sigue la ruta oculta',                 [[-100, -55], [40, 80], [160, -140]], 8500),
    mk(29, 'Blindaje',         'Protege la carga con un convoy',       [[65, 125], [-125, -125]], 9000),
    mk(30, 'Presión',          'Aplica presión en tres puntos',        [[-55, -120], [110, 110], [-140, 40]], 9500),
    mk(31, 'Destrucción',      'Destruye el objetivo marcado',         [[160, 85]], 10000),
    mk(32, 'Paquete misterioso', 'Recoge el paquete en el parque',     [[-40, 35]], 5000),
    mk(33, 'Carrera urbana',   'Gana la carrera por la ciudad',        [[100, -40], [-100, 120], [60, 160]], 5500),
    mk(34, 'Perfil bajo',      'Mantente desapercibido',               [[-115, 75]], 6000),
    mk(35, 'Rescate rápido',   'Rescata antes de tiempo',              [[45, -100], [0, 0]], 6500),
    mk(36, 'Vehículo buscado', 'Recupera el vehículo en la playa',     [[-90, 140], [WATER_X + 15, -40]], 7000),
    mk(37, 'Objetivo eliminado', 'Completa el trabajo',                [[135, -65]], 7500),
    mk(38, 'Transporte especial', 'Transporta con cuidado por el centro', [[-65, -85], [85, 85]], 8000),
    mk(39, 'Seguridad total',  'Asegura la zona en tres puntos',       [[85, 105], [-85, -105], [0, 140]], 8500),
    mk(40, 'Último aviso',     'Da el último aviso',                   [[-125, -45]], 9000),
    mk(41, 'Fallo técnico',    'Causa el fallo en la subestación',     [[55, 155]], 9500),
    mk(42, 'Entrega nocturna', 'Segunda entrega sigilosa',             [[-80, 65], [130, -130]], 5000),
    mk(43, 'Turno de noche',   'Trabajo nocturno por la ciudad',       [[115, -110], [-115, 110]], 5500),
    mk(44, 'Escolta urbana',   'Escolta por la ciudad',                [[-45, 95], [95, -45]], 6000),
    mk(45, 'Robo exprés',      'Robo rápido en el centro',             [[75, -55]], 6500),
    mk(46, 'Limpieza total',   'Segunda limpieza en dos puntos',       [[-105, 130], [105, -130]], 7000),
    mk(47, 'Contrabando mar',  'Segundo contrabando por el muelle',    [[145, 50], [WATER_X + 25, 60]], 7500),
    mk(48, 'Escudo humano',    'Segunda protección',                   [[-35, -75], [65, 145]], 8000),
    mk(49, 'Multa pesada',     'Segunda extorsión en tres tiendas',    [[65, 145], [-65, -145], [145, 65]], 8500),
    mk(50, 'Fuego controlado', 'Segundo sabotaje',                     [[-140, -30]], 9000),
    mk(51, 'Caza de recompensa', 'Captura al objetivo',                [[95, -125], [-95, 125]], 9500),
    mk(52, 'Operación limpia', 'Opera sin testigos',                   [[-70, 45], [70, -45]], 10000),
    mk(53, 'Carga valiosa',    'Protege la carga valiosa',             [[125, 85], [-125, -85]], 5500),
    mk(54, 'Persecución 2',    'Segunda persecución por la autopista', [[-55, -115], [155, 115], [-155, 0]], 6000),
    mk(55, 'Rescate 3',        'Tercer rescate',                       [[40, 65], [-40, -65]], 6500),
    mk(56, 'Hurto exprés',     'Hurto muy rápido en el norte',         [[-120, -65]], 7000),
    mk(57, 'Blanco preciso',   'Tercer objetivo en la torre',          [[155, 115]], 7500),
    mk(58, 'Ruta sigilosa',    'Tercera ruta oculta',                  [[-85, 35], [85, -35], [0, -160]], 8000),
    mk(59, 'Blindaje pesado',  'Segundo blindaje en convoy',           [[70, -95], [-70, 95]], 8500),
    mk(60, 'Presión máxima',   'Segunda presión en tres puntos',       [[-145, 75], [145, -75], [0, 0]], 9000),
    mk(61, 'Caos controlado',  'Causa caos controlado',                [[50, -145], [-50, 145]], 9500),
    mk(62, 'Tercera entrega',  'Otra entrega rápida',                  [[-60, 105], [60, -105]], 5000),
    mk(63, 'Carrera 2',        'Segunda carrera',                      [[105, -35], [-105, 35], [35, 105]], 5500),
    mk(64, 'Vigilancia 2',     'Segunda vigilancia en el puerto',      [[-95, -85]], 6000),
    mk(65, 'Extracción 2',     'Segunda extracción',                   [[135, 55], [-35, -135]], 6500),
    mk(66, 'Robo 3',           'Tercer robo en la play',               [[-40, -135], [WATER_X + 20, 100]], 7000),
    mk(67, 'Eliminación 3',    'Tercera eliminación',                  [[85, 95]], 7500),
    mk(68, 'Contrabando 3',    'Tercer contrabando',                   [[-130, -55], [130, 55]], 8000),
    mk(69, 'Escolta 3',        'Tercera escolta hasta la playa',       [[60, 155], [WATER_X + 10, 0]], 8500),
    mk(70, 'Cobro final',      'Tercera extorsión',                    [[-75, 25], [75, -25]], 9000),
    mk(71, 'Sabotaje 3',       'Tercer sabotaje',                      [[145, -105]], 9500),
    mk(72, 'Fuga 2',           'Segunda fuga de la policía',           [[-110, 65], [110, -65], [-110, -65], [110, 65]], 10000),
    mk(73, 'Transporte 4',     'Cuarto transporte',                    [[45, -75], [-45, 75]], 5500),
    mk(74, 'Seguridad 3',      'Tercera seguridad',                    [[-50, 125], [50, -125]], 6000),
    mk(75, 'Aviso final',      'Último aviso en el centro',            [[115, -45]], 6500),
    mk(76, 'Fallo 2',          'Segundo fallo en la red',              [[-85, -105]], 7000),
    mk(77, 'Entrega 4',        'Cuarta entrega',                       [[75, 75], [-75, -75]], 7500),
    mk(78, 'Persecución 3',    'Tercera persecución',                  [[-135, -25], [135, 25], [0, 135]], 8000),
    mk(79, 'Rescate 4',        'Cuarto rescate en la azotea',          [[95, 145], [-95, -145]], 8500),
    mk(80, 'Robo 4',           'Cuarto robo',                          [[-65, -55]], 9000),
    mk(81, 'Limpieza 3',       'Tercera limpieza',                     [[155, 35], [-155, -35]], 9500),
    mk(82, 'Contrabando 4',    'Cuarto contrabando por el mar',        [[-45, -125], [WATER_X + 40, -125]], 10000),
    mk(83, 'Protección 4',     'Cuarta protección',                    [[65, 55], [-65, -55]], 5500),
    mk(84, 'Extorsión 4',      'Cuarta extorsión',                     [[-115, 95], [115, -95]], 6000),
    mk(85, 'Sabotaje 4',       'Cuarto sabotaje',                      [[40, -155], [-40, 155]], 6500),
    mk(86, 'Fuga 3',           'Tercera fuga',                         [[-70, 45], [70, -45], [0, -140]], 7000),
    mk(87, 'Carga 5',          'Quinta carga',                         [[125, -85], [-125, 85]], 7500),
    mk(88, 'Escolta 4',        'Cuarta escolta',                       [[-90, 145], [90, -145]], 8000),
    mk(89, 'Robo 5',           'Quinto robo',                          [[55, -35]], 8500),
    mk(90, 'Blanco 5',         'Quinto objetivo',                      [[-140, 85], [140, -85]], 9000),
    mk(91, 'Ruta 5',           'Quinta ruta por la ciudad',            [[85, -115], [-85, 115], [115, 85]], 9500),
    mk(92, 'Blindaje 3',       'Tercer blindaje',                      [[-55, 65], [55, -65]], 10000),
    mk(93, 'Presión 3',        'Tercera presión',                      [[145, -55], [-145, 55], [0, 0]], 5500),
    mk(94, 'Caos 2',           'Segundo caos',                         [[-80, -145], [80, 145]], 6000),
    mk(95, 'Entrega 5',        'Quinta entrega final',                 [[70, 115], [-70, -115]], 6500),
    mk(96, 'Carrera final',    'Última carrera',                       [[-125, -75], [125, 75], [0, 160], [-160, 0]], 7000),
    mk(97, 'Vigilancia final', 'Última vigilancia',                    [[110, 45]], 7500),
    mk(98, 'Rescate final',    'Último rescate',                       [[-40, -95], [40, 95]], 8000),
    mk(99, 'Trabajo final',    'Último trabajo antes del retiro',      [[160, 135], [-160, -135], [0, 0]], 8500),
    mk(100,'El retiro',        'MISIÓN FINAL: jubílate con estilo',    [[0, 0], [WATER_X + 30, 60], [-160, 160]], 50000)
];

function startMission(index) {
    if (index < 0 || index >= missions.length) return;
    if (missionMarker) { scene.remove(missionMarker); missionMarker = null; }
    if (missionRing) { scene.remove(missionRing); missionRing = null; }

    currentMissionIndex = index;
    const m = missions[index];
    currentMission = {
        title: m.title, goal: m.desc, reward: m.reward, id: m.id,
        pts: m.pts, stage: 0
    };
    placeMarker();
    updateHUD();
}

function placeMarker() {
    if (missionMarker) { scene.remove(missionMarker); missionMarker = null; }
    if (missionRing) { scene.remove(missionRing); missionRing = null; }
    if (!currentMission) return;
    const pt = currentMission.pts[currentMission.stage];

    // Columna amarilla translúcida estilo GTA
    const col = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 26, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffd93d, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false })
    );
    col.position.set(pt.x, 13, pt.z);
    scene.add(col); missionMarker = col;

    // Anillo giratorio
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, .18, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd93d })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(pt.x, .8, pt.z);
    scene.add(ring); missionRing = ring;
}

function checkMission(dt) {
    if (!currentMission || !playerGroup) return;
    const px = playerCar ? playerCar.position.x : playerGroup.position.x;
    const pz = playerCar ? playerCar.position.z : playerGroup.position.z;
    const pt = currentMission.pts[currentMission.stage];
    const dist = Math.hypot(px - pt.x, pz - pt.z);

    if (missionMarker) {
        missionMarker.rotation.y += dt;
        missionMarker.material.opacity = .25 + Math.sin(clock.elapsedTime * 3) * .1;
    }
    if (missionRing) { missionRing.rotation.z += dt * 1.6; missionRing.position.y = .8 + Math.sin(clock.elapsedTime * 2.5) * .2; }

    if (dist < 5) {
        currentMission.stage++;
        if (currentMission.stage >= currentMission.pts.length) completeMission();
        else {
            placeMarker();
            AudioSys.beep(660, .12, 'sine', .16, 990);
            showToast(`📍 <b>Punto ${currentMission.stage + 1}/${currentMission.pts.length}</b><br>${currentMission.goal}`, '#ffd93d');
        }
    }
}

function completeMission() {
    money += currentMission.reward;
    missionsCompleted.push(currentMission.id);
    if (missionMarker) { scene.remove(missionMarker); missionMarker = null; }
    if (missionRing) { scene.remove(missionRing); missionRing = null; }

    const title = currentMission.title, rew = currentMission.reward;
    currentMission = null; currentMissionIndex = -1;
    saveGame();
    AudioSys.complete();

    showToast(`🏆 <b style="color:#ffd93d">¡MISIÓN COMPLETADA!</b><br>${title}<br><b style="color:#7ce38b">+$${rew.toLocaleString()}</b>`, '#ffd93d');

    const next = missions.findIndex(m => !missionsCompleted.includes(m.id));
    if (next >= 0) setTimeout(() => { if (gameState === 'playing') startMission(next); }, 1600);
    else showToast('🎉 <b>¡HAS COMPLETADO LAS 100 MISIONES!</b><br>¡Eres el rey de la ciudad!', '#ff6b9d');
}
