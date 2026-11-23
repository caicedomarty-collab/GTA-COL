// Generación de la Ciudad Colombiana
function initCity() {
    // Colores de edificios (inspirados en Colombia)
    const buildingColors = [
        0xFFD700, // Oro
        0x4169E1, // Azul
        0x32CD32, // Verde
        0xDC143C, // Rojo
        0xFF8C00, // Naranja
        0x9370DB, // Púrpura
        0x20B2AA, // Turquesa
        0xFF69B4  // Rosa
    ];

    // Crear edificios
    for (let i = 0; i < 50; i++) {
        const width = 10 + Math.random() * 20;
        const height = 20 + Math.random() * 60;
        const depth = 10 + Math.random() * 20;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        const material = new THREE.MeshLambertMaterial({ color: color });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.set(
            (Math.random() - 0.5) * 800,
            height / 2,
            (Math.random() - 0.5) * 800
        );
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);

        // Agregar ventanas (pequeños cubos)
        for (let w = 0; w < 5; w++) {
            for (let h = 0; h < 3; h++) {
                const windowGeom = new THREE.BoxGeometry(2, 3, 0.5);
                const windowMat = new THREE.MeshLambertMaterial({ 
                    color: 0x87CEEB,
                    transparent: true,
                    opacity: 0.7
                });
                const windowMesh = new THREE.Mesh(windowGeom, windowMat);
                windowMesh.position.set(
                    building.position.x + (Math.random() - 0.5) * (width - 2),
                    building.position.y - height/2 + 5 + h * 8,
                    building.position.z + depth/2
                );
                scene.add(windowMesh);
            }
        }
    }

    // Crear calles
    createStreets();

    // Crear elementos colombianos (palmeras, etc.)
    createColombianElements();
}

function createStreets() {
    // Calles principales
    const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
    
    // Calle horizontal
    const street1Geom = new THREE.BoxGeometry(800, 0.1, 20);
    const street1 = new THREE.Mesh(street1Geom, streetMaterial);
    street1.position.set(0, 0.05, 0);
    scene.add(street1);

    // Calle vertical
    const street2Geom = new THREE.BoxGeometry(20, 0.1, 800);
    const street2 = new THREE.Mesh(street2Geom, streetMaterial);
    street2.position.set(0, 0.05, 0);
    scene.add(street2);

    // Líneas de la calle
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    for (let i = -400; i <= 400; i += 20) {
        const lineGeom = new THREE.BoxGeometry(10, 0.1, 0.5);
        const line = new THREE.Mesh(lineGeom, lineMaterial);
        line.position.set(i, 0.1, 0);
        scene.add(line);
        
        const line2Geom = new THREE.BoxGeometry(0.5, 0.1, 10);
        const line2 = new THREE.Mesh(line2Geom, lineMaterial);
        line2.position.set(0, 0.1, i);
        scene.add(line2);
    }
}

function createColombianElements() {
    // Palmeras
    for (let i = 0; i < 20; i++) {
        createPalmTree(
            (Math.random() - 0.5) * 600,
            (Math.random() - 0.5) * 600
        );
    }

    // Banderas colombianas
    for (let i = 0; i < 10; i++) {
        createColombianFlag(
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400
        );
    }
}

function createPalmTree(x, z) {
    // Tronco
    const trunkGeom = new THREE.CylinderGeometry(0.5, 0.8, 15, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.set(x, 7.5, z);
    trunk.castShadow = true;
    scene.add(trunk);

    // Hojas
    for (let i = 0; i < 8; i++) {
        const leafGeom = new THREE.BoxGeometry(8, 0.5, 2);
        const leafMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.set(x, 15, z);
        leaf.rotation.y = (i / 8) * Math.PI * 2;
        leaf.rotation.z = 0.3;
        scene.add(leaf);
    }
}

function createColombianFlag(x, z) {
    // Poste
    const poleGeom = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.set(x, 5, z);
    scene.add(pole);

    // Bandera (simplificada - rectángulos de colores)
    const flagGeom = new THREE.PlaneGeometry(6, 4);
    
    // Amarillo (parte superior)
    const flagYellow = new THREE.Mesh(
        flagGeom,
        new THREE.MeshBasicMaterial({ color: 0xFFD700 })
    );
    flagYellow.position.set(x + 3, 9, z);
    scene.add(flagYellow);

    // Azul (parte central)
    const flagBlue = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1.3),
        new THREE.MeshBasicMaterial({ color: 0x0000FF })
    );
    flagBlue.position.set(x + 3, 7.35, z);
    scene.add(flagBlue);

    // Rojo (parte inferior)
    const flagRed = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1.3),
        new THREE.MeshBasicMaterial({ color: 0xFF0000 })
    );
    flagRed.position.set(x + 3, 5.65, z);
    scene.add(flagRed);
}