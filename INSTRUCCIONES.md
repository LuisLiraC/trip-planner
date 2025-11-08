# Trip Planner - Instrucciones de uso

## Configuración inicial

### 1. Instalar dependencias (ya hecho)
Las dependencias ya están instaladas. Si necesitas reinstalarlas:
```bash
npm install
```

### 2. Configurar Google Maps API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Ve a "Credenciales" y crea una API key
5. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
6. Edita el archivo `.env` y reemplaza `tu_api_key_aqui` con tu API key real

### 3. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Características implementadas

### ✅ Gestión de viajes
- Crear múltiples viajes con nombres personalizados
- Editar nombres de viajes existentes
- Eliminar viajes (con confirmación)
- Ver resumen de días y lugares por viaje

### ✅ Visualización en mapa
- Integración completa con Google Maps
- Búsqueda de lugares usando Google Places
- Marcadores personalizados con colores según el día asignado
- Auto-centrado y ajuste automático del mapa al seleccionar días
- Marcadores de alta visibilidad con efecto de halo y bordes contrastantes
- Zoom y navegación en el mapa

### ✅ Organización por días
- Crear bloques de días ilimitados
- Personalizar título, fecha y color de cada día
- Editar y eliminar días
- Ver cantidad de lugares por día
- Colapsar/expandir la lista de lugares de cada día
- Reordenar bloques de días mediante drag & drop

### ✅ Gestión de lugares
- Buscar y agregar lugares desde el mapa
- Lugares sin asignar (lista inicial)
- Ver nombre y dirección de cada lugar
- Eliminar lugares individualmente

### ✅ Drag & Drop
- Arrastra lugares entre diferentes días
- Mueve lugares de "Sin asignar" a días específicos
- Reorganiza lugares entre bloques fácilmente
- Reordena bloques de días completos arrastrándolos
- Feedback visual cuando arrastras sobre una zona válida

### ✅ Filtrado visual
- Selecciona un día para ver solo sus lugares en el mapa
- El mapa se ajusta automáticamente para mostrar todos los lugares del día seleccionado
- Los marcadores se colorean según el día
- Botón para mostrar todos los lugares a la vez

### ✅ Interfaz profesional
- Diseño moderno con iconos de lucide-react
- Interfaz limpia sin emojis
- Contraste inteligente de texto que se adapta al color de fondo
- Interfaz de edición compacta y eficiente
- Feedback visual en todas las interacciones

### ✅ Persistencia de datos
- Todo se guarda automáticamente en localStorage
- No requiere backend ni servidor
- Los datos persisten entre sesiones
- Exportar todos los viajes a archivo JSON
- Importar viajes desde archivo JSON (fusionar o reemplazar)

## Cómo usar la aplicación

### Crear un viaje
1. En la pantalla principal, escribe el nombre del viaje (ej: "Viaje a Japón Abril 2026")
2. Haz clic en "Crear Viaje"
3. Haz clic en "Abrir" para entrar al viaje

### Agregar lugares
1. Usa la barra de búsqueda en el mapa (parte superior central)
2. Escribe el nombre del lugar (ej: "Fuji TV")
3. Selecciona el lugar de los resultados del autocompletado
4. El mapa se centrará automáticamente en el lugar seleccionado con zoom
5. Aparecerá un marcador temporal y un panel en la parte inferior
6. Haz clic en "Agregar a la lista" para guardarlo
7. El lugar aparecerá en la sección "Sin asignar"
8. Puedes hacer clic en "Cancelar" para deseleccionar el lugar sin agregarlo

### Organizar por días
1. Crea un nuevo día escribiendo un título (ej: "Día 1 - Centro de la ciudad")
2. Haz clic en el botón "+" (solo se habilita cuando escribes texto)
3. El bloque del día aparecerá con un color por defecto (#676767)
4. Haz clic en "Editar" en el bloque del día para:
   - Cambiar el título
   - Seleccionar una fecha
   - Elegir un color personalizado
   - Hacer clic en el botón con ✓ para guardar
5. Arrastra lugares desde "Sin asignar" al día correspondiente
6. También puedes mover lugares entre diferentes días
7. Usa el botón de flecha (▼/▶) en cada bloque para colapsar o expandir la lista de lugares
8. Arrastra el ícono (⋮⋮) en la esquina derecha del encabezado para reordenar días completos

**Nota sobre Drag & Drop:**
- Al arrastrar un **lugar**, suéltalo en el área de la lista de lugares (no en el header con color)
- Al arrastrar un **bloque completo** (usando ⋮⋮), el header del bloque objetivo se pondrá verde
- Si ves el borde verde al arrastrar un lugar, muévelo más abajo hacia el área de la lista

### Filtrar vista del mapa
1. Haz clic en cualquier bloque de día (en el encabezado con color)
2. El bloque seleccionado se resaltará con un borde azul
3. El mapa mostrará solo los lugares de ese día
4. El mapa se ajustará automáticamente para mostrar todos los lugares del día seleccionado
5. Los marcadores tendrán el color del día seleccionado
6. Haz clic en el bloque "Sin asignar" para ver solo lugares no asignados
7. Haz clic en "Mostrar todos los lugares en el mapa" para ver todos los lugares de todos los días

### Exportar e importar viajes

**Exportar:**
1. En la pantalla principal de viajes, haz clic en el botón "Exportar" (verde)
2. Se descargará automáticamente un archivo JSON con todos tus viajes
3. El archivo se llama `trip-planner-backup-YYYY-MM-DD.json`
4. Guarda este archivo en un lugar seguro como backup

**Importar:**
1. En la pantalla principal de viajes, haz clic en el botón "Importar" (morado)
2. Selecciona un archivo JSON exportado previamente
3. Elige una opción:
   - **OK** = Fusionar (agregar a los viajes existentes)
   - **Cancelar** = Reemplazar (eliminar todos los viajes actuales y cargar solo los importados)
4. Se mostrará un mensaje de confirmación con la cantidad de viajes importados

**Nota:** El botón "Exportar" solo está habilitado cuando tienes al menos un viaje guardado.

## Estructura del proyecto

```
trip-planner/
├── src/
│   ├── components/
│   │   ├── TripList.jsx        # Lista de viajes
│   │   ├── TripView.jsx        # Vista individual de viaje
│   │   ├── Map.jsx             # Componente de Google Maps
│   │   ├── PlacesList.jsx      # Lista de lugares y días
│   │   └── DayBlock.jsx        # Bloque individual de día
│   ├── utils/
│   │   └── storage.js          # Funciones de localStorage
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos (Tailwind)
├── .env                       # API keys (no incluido en git)
├── .env.example              # Ejemplo de configuración
└── package.json              # Dependencias
```

## Tecnologías utilizadas

- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS v4** - Estilos (configuración diferente a v3)
- **@vis.gl/react-google-maps** - Integración con Google Maps
- **@dnd-kit** - Drag and drop
- **lucide-react** - Biblioteca de iconos profesionales
- **localStorage** - Persistencia de datos

### Configuración de Tailwind CSS v4

Este proyecto usa Tailwind CSS v4, que tiene una configuración diferente a la versión 3:

**src/index.css:**
```css
@import "tailwindcss";
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**Nota importante:** No se usa archivo `tailwind.config.js` en v4. La configuración se hace directamente en el CSS.

### Marcadores personalizados en el mapa

Los marcadores del mapa se generan dinámicamente usando SVG con el color del día asignado:

**Implementación (Map.jsx):**
```javascript
const createColoredMarkerIcon = (color) => {
  const svgMarker = `
    <svg width="50" height="60" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <!-- Sombra -->
      <ellipse cx="20" cy="44" rx="12" ry="4" fill="#000000" opacity="0.4"/>
      <!-- Halo/Glow exterior blanco -->
      <path d="..." fill="none" stroke="#FFFFFF" stroke-width="6" opacity="0.8"/>
      <!-- Borde negro para contraste -->
      <path d="..." fill="none" stroke="#000000" stroke-width="3"/>
      <!-- Pin con color del día -->
      <path d="..." fill="${color || '#4285F4'}"/>
      <!-- Círculo interior blanco -->
      <circle cx="20" cy="16" r="6" fill="#FFFFFF"/>
      <!-- Punto de color -->
      <circle cx="20" cy="16" r="3.5" fill="${color || '#4285F4'}"/>
    </svg>
  `
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgMarker),
    scaledSize: { width: 50, height: 60 },
    anchor: { x: 25, y: 60 }
  }
}
```

**Características:**
- Tamaño: 50x60px (optimizado para visibilidad sin ocupar demasiado espacio)
- Halo blanco semi-transparente para resaltar
- Borde negro para contraste contra cualquier fondo
- Color dinámico según el día asignado
- Centro con círculo blanco y punto de color para fácil identificación

### Auto-centrado del mapa

El mapa se ajusta automáticamente cuando cambian los lugares visibles:

**Implementación (Map.jsx):**
```javascript
useEffect(() => {
  if (!map || !places || places.length === 0) return

  // Si solo hay un lugar, centrar en él
  if (places.length === 1) {
    map.panTo({ lat: places[0].lat, lng: places[0].lng })
    map.setZoom(14)
    return
  }

  // Si hay múltiples lugares, ajustar bounds para mostrarlos todos
  const bounds = new window.google.maps.LatLngBounds()
  places.forEach(place => {
    bounds.extend({ lat: place.lat, lng: place.lng })
  })

  map.fitBounds(bounds, {
    padding: { top: 80, right: 80, bottom: 80, left: 80 }
  })
}, [map, places])
```

### Contraste inteligente de texto

El texto en los bloques de días se ajusta automáticamente según la luminosidad del color de fondo:

**Implementación (DayBlock.jsx):**
```javascript
const shouldUseDarkText = (bgColor) => {
  if (!bgColor) return false
  // Convertir hex a RGB
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  // Calcular luminosidad usando fórmula estándar
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}
```

**Uso:**
```javascript
const textColorClass = shouldUseDarkText(color) ? 'text-gray-800' : 'text-white'
```

Esto asegura que el texto sea siempre legible, independientemente del color de fondo elegido por el usuario.

## Notas importantes

- Los datos se guardan automáticamente en localStorage del navegador
- Si borras los datos del navegador, perderás los viajes guardados
- La API de Google Maps tiene límites de uso gratuito (consulta tu cuota en Google Cloud Console)
- Asegúrate de no compartir tu `.env` file (está en .gitignore)
- Es normal ver algunos warnings de deprecación en la consola del navegador (Google Maps está migrando a nuevas APIs)
- Estos warnings no afectan la funcionalidad de la aplicación

## Problemas comunes

### El mapa no carga
- Verifica que el archivo `.env` existe y tiene la API key correcta
- Asegúrate de haber habilitado Maps JavaScript API y Places API
- Revisa la consola del navegador para ver errores

### La búsqueda de lugares no funciona
- Verifica que Places API está habilitada en Google Cloud Console
- Comprueba que la API key tiene los permisos correctos

### Los cambios no se guardan
- Abre las DevTools del navegador y verifica el localStorage
- Asegúrate de que el navegador permite localStorage

### Drag and drop no funciona correctamente
- Para mover **lugares**: Suelta sobre el área de la lista de lugares (zona gris/blanca), no sobre el header con color
- Para mover **bloques**: Arrastra desde el ícono (⋮⋮) y suelta sobre el header de otro bloque
- Si ves un borde verde al arrastrar un lugar, estás sobre la zona de bloques; mueve el cursor más abajo
- El cursor debe cambiar a "move" cuando arrastras

### No puedo exportar los viajes
- El botón "Exportar" solo está habilitado si tienes al menos un viaje guardado
- Si no aparece el archivo descargado, verifica la carpeta de descargas de tu navegador

### Error al importar viajes
- Asegúrate de seleccionar un archivo JSON válido exportado por esta aplicación
- El archivo debe tener la extensión `.json`
- Si el archivo fue modificado manualmente, puede estar corrupto
