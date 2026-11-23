# 🏖️ Colombia GTA — Vice City · Edición Definitiva

Juego 3D de **mundo abierto** estilo *GTA Vice City*, ambientado en una ciudad colombiana con playa y océano. Corre directamente en el navegador (Three.js), optimizado para PCs con gráficos integrados.

![estilo](https://img.shields.io/badge/estilo-GTA%20Vice%20City-ff6b9d) ![misiones](https://img.shields.io/badge/misiones-100-ffd93d) ![3D](https://img.shields.io/badge/render-3D%20WebGL-6bcb77)

## ✨ Contenido

### 🌆 Mundo
- Ciudad de 5×5 manzanas con **playa y océano animado** (olas en tiempo real)
- **Fachadas con ventanas** iluminadas, locales comerciales, balcones y tanques de agua
- Asfalto texturizado con marcas viales, aceras con baldosas, césped
- **Rótulos publicitarios con neones** (PAISITA, CAFÉ ANDINO, RON DEL PAÍS...)
- Palmeras con cocos, farolas con luz real, sombrillas de playa, muelle de madera
- Atardecer tropical estilo Vice City con sol, nubes a la deriva y niebla dorada
- **Casa franca** 🏠: guarda la partida y restaura vida/chaleco

### 🚗 Vehículos (todos conducibles con E)
| Vehículo | Notas |
|----------|-------|
| Autos | Tráfico IA + carros estacionados |
| Motos | Ágiles, 5 en circulación |
| **Barcos** | En el mar + muelle; flotan y navegan |
| **Aviones** | Vuelo libre: ESPACIO sube, SHIFT baja, hélices girando |
| **Tanques** | 3 en la ciudad, con cañón y ametralladora |
| Patrullas | Balizo rojo/azul parpadeante, persiguen con estrellas |

### 🔫 Armas (teclas 1-2-3)
- **Pistola**, **Subfusil** (automático) y **Escopeta** — con disparo, retroceso visual, destello, partículas de impacto y **explotan los vehículos**
- Sistema de **búsqueda policial** ⭐1-5: las patrullas te persiguen y atacan
- **Pickups**: ❤️ vida, 🛡️ armadura, 💵 dinero, 🔫 armas

### 🎯 100 misiones
- 20 de **historia** + 80 secundarias
- **Múltiples puntos por misión** con marcador dorado estilo GTA
- Recompensas, guardado automático y panel de misiones con progreso

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| **W A S D / FLECHAS** | Mover / conducir |
| ESPACIO | Saltar · avión: ascender |
| SHIFT | Correr · avión: descender |
| CLIC | Disparar |
| 1 / 2 / 3 | Pistola / Subfusil / Escopeta |
| E | Entrar / salir vehículo |
| M | Lista de misiones |
| ESC | Pausa |
| Ratón | Cámara |

## 🖥️ Requisitos

- Cualquier navegador moderno (Chrome, Edge, Firefox)
- Sin instalación: GPU integrada basta (probado a 60 FPS)
- Internet solo para cargar Three.js desde CDN

## 🚀 Jugar localmente

```bash
python -m http.server 8000
# abre http://localhost:8000
```

## 🌐 Desplegar en GitHub Pages

1. Sube todos los archivos a tu repositorio (en la raíz)
2. **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**
3. En unos minutos estará en: `https://TU-USUARIO.github.io/TU-REPO/`

## 📁 Estructura

```
├── index.html    → Interfaz, HUD y menús
├── style.css     → Estilo HUD Vice City
├── game.js       → Motor, cámara, radar, audio, texturas, pausa
├── city.js       → Ciudad, playa, océano, casa franca, rótulos
├── player.js     → Jugador, armas, vehículos, policía, peatones, pickups
├── missions.js   → 100 misiones multipunto
└── README.md
```

## 📖 Historia

Después de años fuera, regresas a tu ciudad natal en Colombia. El barrio cambió, las viejas amistades ahora son enemigos poderosos, y solo tú decides cómo hacerte un nombre: **100 misiones** te esperan desde el mercado hasta la playa.

## Licencia

MIT
