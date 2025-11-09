import { useState, useRef, useEffect } from 'react'
import { APIProvider, Map as GoogleMap, Marker, useMap, InfoWindow } from '@vis.gl/react-google-maps'
import { addPlace } from '../utils/storage'
import { MapPin, Plus, X, Star, Phone, Globe, Clock, DollarSign, ExternalLink } from 'lucide-react'

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
        fields: [
          'name',
          'geometry',
          'formatted_address',
          'place_id',
          'photos',
          'rating',
          'user_ratings_total',
          'formatted_phone_number',
          'website',
          'opening_hours',
          'price_level',
          'types'
        ]
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
          placeId: place.place_id,
          photo: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
          rating: place.rating,
          ratingsTotal: place.user_ratings_total,
          phone: place.formatted_phone_number,
          website: place.website,
          openingHours: place.opening_hours?.weekday_text,
          isOpenNow: place.opening_hours?.isOpen?.(),
          priceLevel: place.price_level,
          types: place.types
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
    <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-1rem)] sm:w-96 max-w-md">
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar lugares..."
        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white text-sm md:text-base"
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
function MapContent({ places, onPlaceSelect, selectedPlace, focusedPlace }) {
  const map = useMap()
  const [selectedMarker, setSelectedMarker] = useState(null)

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

  // Cuando se hace clic en un lugar desde la lista, centrar y mostrar InfoWindow
  useEffect(() => {
    if (!map || !focusedPlace) return

    // Usar un pequeño timeout para asegurar que el zoom se aplique después del pan
    map.panTo({ lat: focusedPlace.lat, lng: focusedPlace.lng })
    setTimeout(() => {
      map.setZoom(16)
    }, 100)
    setSelectedMarker(focusedPlace)
  }, [map, focusedPlace])

  // Listener para clicks en POIs del mapa
  useEffect(() => {
    if (!map) return

    const clickListener = map.addListener('click', async (event) => {
      // Si el click tiene placeId, es un POI de Google Maps
      if (event.placeId) {
        event.stop() // Prevenir el comportamiento por defecto

        // Crear servicio de Places para obtener detalles
        const service = new window.google.maps.places.PlacesService(map)

        service.getDetails(
          {
            placeId: event.placeId,
            fields: [
              'name',
              'geometry',
              'formatted_address',
              'place_id',
              'photos',
              'rating',
              'user_ratings_total',
              'formatted_phone_number',
              'website',
              'opening_hours',
              'price_level',
              'types'
            ]
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              const placeData = {
                name: place.name,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
                placeId: place.place_id,
                photo: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
                rating: place.rating,
                ratingsTotal: place.user_ratings_total,
                phone: place.formatted_phone_number,
                website: place.website,
                openingHours: place.opening_hours?.weekday_text,
                isOpenNow: place.opening_hours?.isOpen?.(),
                priceLevel: place.price_level,
                types: place.types
              }

              onPlaceSelect(placeData)
            }
          }
        )
      }
    })

    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener)
      }
    }
  }, [map, onPlaceSelect])

  const renderPriceLevel = (level) => {
    if (!level) return null
    return '$'.repeat(level)
  }

  return (
    <>
      {/* Marcadores para lugares guardados */}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          icon={createColoredMarkerIcon(place.color)}
          onClick={() => setSelectedMarker(place)}
        />
      ))}

      {/* Marcador temporal para lugar seleccionado */}
      {selectedPlace && (
        <Marker
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          title={selectedPlace.name}
          icon={createColoredMarkerIcon('#4285F4')}
          onClick={() => setSelectedMarker(selectedPlace)}
        />
      )}

      {/* InfoWindow para mostrar detalles del lugar */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="max-w-xs">
            {/* Foto del lugar */}
            {selectedMarker.photo && (
              <img
                src={selectedMarker.photo}
                alt={selectedMarker.name}
                className="w-full h-32 object-cover rounded-t-lg -mt-3 -mx-3 mb-2"
              />
            )}

            {/* Nombre */}
            <h3 className="font-bold text-gray-900 text-base mb-1">{selectedMarker.name}</h3>

            {/* Rating y precio */}
            <div className="flex items-center gap-3 mb-2">
              {selectedMarker.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{selectedMarker.rating}</span>
                  {selectedMarker.ratingsTotal && (
                    <span className="text-gray-500">({selectedMarker.ratingsTotal})</span>
                  )}
                </div>
              )}
              {selectedMarker.priceLevel && (
                <div className="flex items-center text-sm text-gray-600">
                  <span>{renderPriceLevel(selectedMarker.priceLevel)}</span>
                </div>
              )}
            </div>

            {/* Estado (abierto/cerrado) */}
            {selectedMarker.isOpenNow !== undefined && (
              <div className="flex items-center gap-1 mb-2">
                <Clock size={14} className={selectedMarker.isOpenNow ? 'text-green-600' : 'text-red-600'} />
                <span className={`text-sm font-medium ${selectedMarker.isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedMarker.isOpenNow ? 'Abierto ahora' : 'Cerrado'}
                </span>
              </div>
            )}

            {/* Dirección */}
            {selectedMarker.address && (
              <p className="text-sm text-gray-600 mb-2">{selectedMarker.address}</p>
            )}

            {/* Teléfono */}
            {selectedMarker.phone && (
              <div className="flex items-center gap-2 mb-2">
                <Phone size={14} className="text-gray-500" />
                <a href={`tel:${selectedMarker.phone}`} className="text-sm text-blue-600 hover:underline">
                  {selectedMarker.phone}
                </a>
              </div>
            )}

            {/* Sitio web */}
            {selectedMarker.website && (
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-gray-500" />
                <a
                  href={selectedMarker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  Sitio web <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Botón para ver en Google Maps */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedMarker.lat},${selectedMarker.lng}&query_place_id=${selectedMarker.placeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
            >
              Ver en Google Maps <ExternalLink size={12} />
            </a>
          </div>
        </InfoWindow>
      )}

      <SearchBox onPlaceSelect={onPlaceSelect} />
    </>
  )
}

export default function Map({ places, onPlaceAdded, tripId, focusedPlace }) {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [center] = useState({ lat: 35.6762, lng: 139.6503 }) // Tokyo por defecto
  const [zoom] = useState(12)

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
            focusedPlace={focusedPlace}
          />
        </GoogleMap>

        {/* Botón para agregar lugar seleccionado */}
        {selectedPlace && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-4 duration-200 w-[calc(100%-1rem)] sm:w-auto">
            <div className="bg-white rounded-lg shadow-xl p-3 md:p-4 max-w-md border border-gray-200">
              <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 md:gap-2 mb-1">
                    <MapPin size={14} className="text-blue-600 flex-shrink-0 md:w-4 md:h-4" />
                    <p className="text-xs font-medium text-gray-500">Lugar seleccionado</p>
                  </div>
                  <p className="font-semibold text-gray-800 truncate text-sm md:text-base">{selectedPlace.name}</p>
                  {selectedPlace.address && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedPlace.address}</p>
                  )}
                  {selectedPlace.placeId && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}&query_place_id=${selectedPlace.placeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1 md:mt-2"
                    >
                      Ver en Google Maps <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPlace}
                  className="flex-1 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                >
                  <Plus size={16} />
                  <span>Agregar</span>
                </button>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="px-2 md:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  title="Cancelar"
                >
                  <X size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </APIProvider>
  )
}
