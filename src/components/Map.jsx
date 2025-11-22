import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { addPlace } from '../utils/storage'
import { MapPin, Plus, X, Search } from 'lucide-react'

// Función para crear un icono de marcador con color personalizado
const createColoredMarkerIcon = (color) => {
  const svgMarker = `
    <svg width="50" height="60" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="44" rx="12" ry="4" fill="#000000" opacity="0.4"/>
      <path
        d="M20 4C13.37 4 8 9.37 8 16c0 8.75 12 24 12 24s12-15.25 12-24c0-6.63-5.37-12-12-12z"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="6"
        opacity="0.8"
      />
      <path
        d="M20 4C13.37 4 8 9.37 8 16c0 8.75 12 24 12 24s12-15.25 12-24c0-6.63-5.37-12-12-12z"
        fill="none"
        stroke="#000000"
        stroke-width="3"
      />
      <path
        d="M20 4C13.37 4 8 9.37 8 16c0 8.75 12 24 12 24s12-15.25 12-24c0-6.63-5.37-12-12-12z"
        fill="${color || '#4285F4'}"
      />
      <circle cx="20" cy="16" r="6" fill="#FFFFFF"/>
      <circle cx="20" cy="16" r="3.5" fill="${color || '#4285F4'}"/>
    </svg>
  `

  return L.divIcon({
    html: svgMarker,
    className: 'custom-marker',
    iconSize: [50, 60],
    iconAnchor: [25, 60],
    popupAnchor: [0, -60]
  })
}

// Componente para búsqueda con Photon (Komoot) - mejor para lugares turísticos
function SearchBox({ onPlaceSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)
  const map = useMap()

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Disable click propagation to Leaflet map
  useEffect(() => {
    if (searchRef.current) {
      L.DomEvent.disableClickPropagation(searchRef.current)
      L.DomEvent.disableScrollPropagation(searchRef.current)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const doSearch = async () => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const center = map.getCenter()
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=7&lat=${center.lat}&lon=${center.lng}&lang=en`

        const response = await fetch(photonUrl)
        const data = await response.json()

        const transformedResults = data.features?.map(feature => ({
          place_id: feature.properties.osm_id,
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          name: feature.properties.name,
          display_name: [
            feature.properties.name,
            feature.properties.street,
            feature.properties.city || feature.properties.town || feature.properties.village,
            feature.properties.state,
            feature.properties.country
          ].filter(Boolean).join(', '),
          type: feature.properties.osm_value,
          osm_id: feature.properties.osm_id
        })) || []

        setResults(transformedResults)
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(doSearch, 250)
    return () => clearTimeout(timer)
  }, [query, map])

  const handleSelectPlace = (place) => {
    const placeData = {
      name: place.name || place.display_name.split(',')[0],
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      address: place.display_name,
      placeId: place.osm_id?.toString() || null
    }

    // Centrar el mapa en el lugar seleccionado
    map.flyTo([placeData.lat, placeData.lng], 15)

    onPlaceSelect(placeData)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div
      ref={searchRef}
      className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-1rem)] sm:w-96 max-w-md"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <Search
          size={16}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search places..."
          className="w-full py-2.5 md:py-3 pl-11 pr-4 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white text-sm md:text-base"
        />
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div className="mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          {results.map((place, index) => (
            <button
              key={place.place_id || index}
              onClick={() => handleSelectPlace(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <p className="font-medium text-gray-800 text-sm truncate">
                {place.name || place.display_name.split(',')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {place.display_name}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="mt-1 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">No results found</p>
        </div>
      )}
    </div>
  )
}

// Componente para ajustar el mapa y manejar eventos
function MapController({ places, focusedPlace, onPlaceSelect }) {
  const map = useMap()

  // Ajustar el mapa cuando cambian los lugares
  useEffect(() => {
    if (!places || places.length === 0) return

    // Si solo hay un lugar, centrar en él
    if (places.length === 1) {
      map.flyTo([places[0].lat, places[0].lng], 14)
      return
    }

    // Si hay múltiples lugares, ajustar bounds para mostrarlos todos
    const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [80, 80] })
  }, [map, places])

  // Cuando se hace clic en un lugar desde la lista, centrar
  useEffect(() => {
    if (!focusedPlace) return
    map.flyTo([focusedPlace.lat, focusedPlace.lng], 16)
  }, [map, focusedPlace])

  // Click en el mapa para agregar lugar personalizado
  useEffect(() => {
    const handleClick = async (e) => {
      const { lat, lng } = e.latlng

      // Reverse geocoding con Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'TripPlanner/1.0'
            }
          }
        )
        const data = await response.json()

        const placeData = {
          name: data.name || data.address?.road || data.address?.city || 'Selected location',
          lat,
          lng,
          address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          placeId: data.osm_id?.toString() || null
        }

        onPlaceSelect(placeData)
      } catch {
        // Si falla el geocoding, usar coordenadas
        onPlaceSelect({
          name: 'Selected location',
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          placeId: null
        })
      }
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [map, onPlaceSelect])

  return <SearchBox onPlaceSelect={onPlaceSelect} />
}

export default function Map({ places, onPlaceAdded, tripId, focusedPlace }) {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const defaultCenter = [35.6762, 139.6503] // Tokyo por defecto
  const defaultZoom = 12

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

  return (
    <div className="h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Controlador del mapa */}
        <MapController
          places={places}
          focusedPlace={focusedPlace}
          onPlaceSelect={handlePlaceSelect}
        />

        {/* Marcadores para lugares guardados */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createColoredMarkerIcon(place.color)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-gray-900 text-base mb-1">{place.name}</h3>
                {place.address && (
                  <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                )}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=17/${place.lat}/${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View on OpenStreetMap
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcador temporal para lugar seleccionado */}
        {selectedPlace && (
          <Marker
            position={[selectedPlace.lat, selectedPlace.lng]}
            icon={createColoredMarkerIcon('#4285F4')}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-gray-900 text-base mb-1">{selectedPlace.name}</h3>
                {selectedPlace.address && (
                  <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Botón para agregar lugar seleccionado */}
      {selectedPlace && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in slide-in-from-bottom-4 duration-200 w-[calc(100%-1rem)] sm:w-auto">
          <div className="bg-white rounded-lg shadow-xl p-3 md:p-4 max-w-md border border-gray-200">
            <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 md:gap-2 mb-1">
                  <MapPin size={14} className="text-blue-600 flex-shrink-0 md:w-4 md:h-4" />
                  <p className="text-xs font-medium text-gray-500">Selected place</p>
                </div>
                <p className="font-semibold text-gray-800 truncate text-sm md:text-base">{selectedPlace.name}</p>
                {selectedPlace.address && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedPlace.address}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddPlace}
                className="flex-1 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-2 md:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                title="Cancel"
              >
                <X size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
