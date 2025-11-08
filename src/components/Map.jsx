import { useState, useRef, useEffect } from 'react'
import { APIProvider, Map as GoogleMap, Marker, useMap } from '@vis.gl/react-google-maps'
import { addPlace } from '../utils/storage'
import { MapPin, Plus, X } from 'lucide-react'

// Componente para el autocompletado de búsqueda
function SearchBox({ onPlaceSelect }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const map = useMap()

  useEffect(() => {
    if (!inputRef.current) return

    // Esperar a que Google Maps esté disponible
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initAutocomplete, 100)
        return
      }

      // Crear el autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['name', 'geometry', 'formatted_address', 'place_id']
      })

      // Listener para cuando se selecciona un lugar
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()

        if (!place || !place.geometry || !place.geometry.location) {
          // No hacer nada si no hay un lugar válido seleccionado
          return
        }

        const placeData = {
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
          placeId: place.place_id
        }

        // Centrar el mapa en el lugar seleccionado
        if (map) {
          map.panTo(place.geometry.location)
          map.setZoom(15)
        }

        onPlaceSelect(placeData)
      })
    }

    initAutocomplete()
  }, [onPlaceSelect, map])

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-96">
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar lugares..."
        className="w-full px-4 py-3 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
      />
    </div>
  )
}

// Función para crear un icono de marcador con color personalizado
const createColoredMarkerIcon = (color) => {
  // Diseño moderno con doble borde contrastante y efecto visual fuerte
  const svgMarker = `
    <svg width="50" height="60" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <!-- Sombra difusa grande -->
      <ellipse cx="20" cy="44" rx="12" ry="4" fill="#000000" opacity="0.4"/>

      <!-- Halo/Glow exterior blanco -->
      <path
        d="M20 4C13.37 4 8 9.37 8 16c0 8.75 12 24 12 24s12-15.25 12-24c0-6.63-5.37-12-12-12z"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="6"
        opacity="0.8"
      />

      <!-- Borde negro exterior para contraste -->
      <path
        d="M20 4C13.37 4 8 9.37 8 16c0 8.75 12 24 12 24s12-15.25 12-24c0-6.63-5.37-12-12-12z"
        fill="none"
        stroke="#000000"
        stroke-width="3"
      />

      <!-- Pin principal con el color -->
      <path
        d="M20 4C13.37 4 8 9.37 8 16c0 8.75 12 24 12 24s12-15.25 12-24c0-6.63-5.37-12-12-12z"
        fill="${color || '#4285F4'}"
      />

      <!-- Círculo interior blanco grande para máximo contraste -->
      <circle cx="20" cy="16" r="6" fill="#FFFFFF"/>

      <!-- Punto de color en el centro -->
      <circle cx="20" cy="16" r="3.5" fill="${color || '#4285F4'}"/>
    </svg>
  `

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgMarker),
    scaledSize: { width: 50, height: 60 },
    anchor: { x: 25, y: 60 }
  }
}

// Componente interno que tiene acceso al mapa
function MapContent({ places, onPlaceSelect, selectedPlace, handleAddPlace }) {
  const map = useMap()

  // Ajustar el mapa cuando cambian los lugares
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

  return (
    <>
      {/* Marcadores para lugares guardados */}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          icon={createColoredMarkerIcon(place.color)}
        />
      ))}

      {/* Marcador temporal para lugar seleccionado */}
      {selectedPlace && (
        <Marker
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          title={selectedPlace.name}
          icon={createColoredMarkerIcon('#4285F4')}
        />
      )}

      <SearchBox onPlaceSelect={onPlaceSelect} />
    </>
  )
}

export default function Map({ places, onPlaceAdded, tripId }) {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.6503 }) // Tokyo por defecto
  const [zoom, setZoom] = useState(12)

  const handlePlaceSelect = (placeData) => {
    setSelectedPlace(placeData)
  }

  const handleAddPlace = () => {
    if (selectedPlace) {
      addPlace(tripId, selectedPlace)
      setSelectedPlace(null)
      onPlaceAdded()
    }
  }

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!API_KEY) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Google Maps API Key requerida
          </h3>
          <p className="text-gray-600 mb-4">
            Para usar el mapa, necesitas configurar tu API key de Google Maps.
          </p>
          <ol className="text-left text-sm text-gray-600 space-y-2">
            <li>1. Crea un archivo <code className="bg-gray-100 px-2 py-1 rounded">.env</code> en la raíz del proyecto</li>
            <li>2. Agrega: <code className="bg-gray-100 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY=tu_api_key</code></li>
            <li>3. Obtén tu API key en: <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
            <li>4. Asegúrate de habilitar Maps JavaScript API y Places API</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <div className="h-full relative">
        <GoogleMap
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="trip-planner-map"
          gestureHandling="greedy"
        >
          <MapContent
            places={places}
            onPlaceSelect={handlePlaceSelect}
            selectedPlace={selectedPlace}
            handleAddPlace={handleAddPlace}
          />
        </GoogleMap>

        {/* Botón para agregar lugar seleccionado */}
        {selectedPlace && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-md border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                    <p className="text-xs font-medium text-gray-500">Lugar seleccionado</p>
                  </div>
                  <p className="font-semibold text-gray-800 truncate">{selectedPlace.name}</p>
                  {selectedPlace.address && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedPlace.address}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPlace}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Agregar</span>
                </button>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  title="Cancelar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </APIProvider>
  )
}
