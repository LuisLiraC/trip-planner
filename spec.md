# Trip Planner - Especificación del Producto

Aplicación web para planificar viajes de forma visual.
- Solo para uso personal (no requiere autenticación)
- No requiere backend (todo se guarda en localStorage del navegador)
- Interfaz visual con mapa interactivo

---

## Características del Producto

### 1. Gestión de Viajes

**Múltiples viajes**
- Puedo crear múltiples viajes guardados
- Cada viaje tiene un nombre personalizado (ej: "Viaje a Japón Abril 2026", "Viaje a Nueva York Diciembre 2026")
- Cada viaje mantiene su propia lista de lugares y días

**Operaciones CRUD**
- Crear nuevos viajes
- Editar nombre de viajes existentes
- Eliminar viajes (con confirmación)
- Ver resumen de cada viaje: cantidad de días y lugares

---

### 2. Vista de Viaje (Pantalla Principal)

**Layout de dos columnas**
- **Lado izquierdo:** Mapa interactivo con búsqueda
- **Lado derecho:** Lista organizada de lugares y días

**Mapa interactivo**
- Integración con Google Maps
- Búsqueda de lugares por nombre (ej: "Fuji TV")
- Al buscar, el mapa se centra automáticamente en la ubicación
- Marcadores de colores según el día asignado
- Marcador temporal para lugar seleccionado antes de agregarlo
- Panel de confirmación para agregar lugares

**Navegación**
- Botón "Volver" para regresar a la lista de viajes
- Título del viaje siempre visible

---

### 3. Organización por Días (Bloques)

**Estructura de días**
- Puedo crear bloques de días ilimitados
- Cada día es un bloque con:
  - Título personalizable (ej: "Día 1 - Centro de la ciudad")
  - Fecha opcional
  - Color personalizable para identificación visual
  - Lista de lugares asignados a ese día

**Ejemplo de organización:**
```
📅 Día 1 (15 de Abril de 2026) 🟦 #676767
   - Tokyo Tower
   - Senso-ji Temple
   - Akihabara

📅 Día 2 (16 de Abril de 2026) 🟪 #761271
   - Fuji TV
   - TeamLab Borderless
   - Odaiba Beach

📋 Sin asignar
   - Tsukiji Market
   - Imperial Palace
   - Shibuya Crossing
```

**Operaciones con días**
- Crear nuevo día
- Editar propiedades del día (título, fecha, color)
- Eliminar día (los lugares se mueven automáticamente a "Sin asignar")
- Colapsar/expandir lista de lugares de cada día
- Reordenar días completos (cambiar el orden de los bloques)
- Ver cantidad de lugares por día

---

### 4. Gestión de Lugares

**Agregar lugares**
1. Buscar lugar en el mapa usando la barra de búsqueda
2. Seleccionar de los resultados
3. Ver ubicación en el mapa con marcador temporal
4. Confirmar para agregar o cancelar
5. Los lugares nuevos van a la lista "Sin asignar"

**Información de cada lugar**
- Nombre del lugar
- Dirección completa
- Ubicación geográfica (lat/lng)
- Marcador en el mapa

**Operaciones con lugares**
- Agregar desde búsqueda del mapa
- Mover entre días mediante drag & drop
- Eliminar lugares individuales

---

### 5. Drag & Drop (Arrastrar y Soltar)

**Mover lugares**
- Arrastrar lugar desde "Sin asignar" a cualquier día
- Arrastrar lugar de un día a otro día
- Arrastrar lugar de cualquier día de vuelta a "Sin asignar"
- Feedback visual cuando arrastro sobre zona válida

**Reordenar bloques de días**
- Puedo cambiar el orden de los bloques de días
- Arrastro desde el ícono especial (⋮⋮) en cada bloque
- El bloque "Sin asignar" siempre permanece al final

---

### 6. Filtrado Visual en Mapa

**Selección de día**
- Puedo hacer clic en cualquier bloque de día
- El bloque seleccionado se resalta visualmente con borde azul
- El mapa muestra solo los lugares de ese día
- El mapa se ajusta automáticamente para mostrar todos los lugares del día seleccionado
- Los marcadores usan el color del día seleccionado

**Ver todos los lugares**
- Botón para mostrar todos los lugares de todos los días
- Cada marcador mantiene el color de su día asignado
- Los lugares sin asignar tienen color gris

**Marcadores personalizados**
- Marcadores de alta visibilidad con diseño moderno
- Colores que coinciden exactamente con el color del día asignado
- Efecto de halo blanco y borde negro para destacar sobre cualquier fondo
- Tamaño optimizado (50x60px) para balance entre visibilidad y usabilidad

---

### 7. Persistencia de Datos

**Guardado automático**
- Todos los cambios se guardan automáticamente
- No hay botón "Guardar" - todo es instantáneo
- Los datos persisten entre sesiones del navegador
- Almacenamiento local (no se necesita conexión)

**Exportar e Importar**
- Puedo exportar todos mis viajes a un archivo JSON
- El archivo se descarga con fecha automáticamente (ej: `trip-planner-backup-2026-04-15.json`)
- Puedo importar viajes desde un archivo JSON
- Al importar puedo elegir entre:
  - **Fusionar**: Agregar los viajes importados a los existentes
  - **Reemplazar**: Eliminar todos los viajes actuales y cargar solo los importados
- Validación automática del formato del archivo
- Útil para hacer backup, compartir viajes con otras personas, o transferir entre dispositivos

---

### 8. Interfaz y Diseño Visual

**Diseño profesional y limpio**
- Interfaz moderna sin emojis
- Iconos profesionales de lucide-react
- Paleta de colores coherente y agradable
- Diseño compacto que aprovecha el espacio

**Edición de días**
- Interfaz de edición compacta y eficiente
- Controles visuales: campo de texto, selector de fecha con icono, selector de color
- Botones de confirmación/cancelación integrados
- Contraste inteligente de texto que se adapta automáticamente al color de fondo

**Feedback visual**
- Resaltado de bloques seleccionados
- Indicadores visuales durante drag & drop
- Estados hover en botones y elementos interactivos
- Transiciones suaves entre estados

---

## Estado de Implementación

✅ **Todas las características especificadas han sido implementadas y están funcionando.**

El producto está completo y listo para usar. Consulta el archivo `INSTRUCCIONES.md` para detalles de instalación, configuración y uso.

