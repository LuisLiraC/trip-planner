import { useState, useEffect } from 'react'
import { getTrip, movePlace } from '../utils/storage'
import Map from './Map'
import PlacesList from './PlacesList'
import { Menu, X, MoveRight } from 'lucide-react'

export default function TripView({ tripId, onBack }) {
  const [trip, setTrip] = useState(null)
  const [selectedDayId, setSelectedDayId] = useState(null)
  const [focusedPlace, setFocusedPlace] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const [targetDayId, setTargetDayId] = useState('')

  const loadTrip = () => {
    const tripData = getTrip(tripId)
    setTrip(tripData)
  }

  useEffect(() => {
    loadTrip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const handlePlaceAdded = () => {
    loadTrip()
  }

  const handleDayUpdated = () => {
    loadTrip()
  }

  const handlePlaceClick = (place) => {
    setFocusedPlace(place)
  }

  const handleMoveSelected = () => {
    if (!targetDayId || selectedPlaces.length === 0 || !trip) return

    selectedPlaces.forEach(placeId => {
      let sourceDayId = 'unassigned'

      if (trip.unassignedPlaces.find(p => p.id === placeId)) {
        sourceDayId = 'unassigned'
      } else {
        const sourceDay = trip.days.find(d => d.places.find(p => p.id === placeId))
        if (sourceDay) {
          sourceDayId = sourceDay.id
        }
      }

      if (sourceDayId !== targetDayId) {
        movePlace(tripId, placeId, sourceDayId, targetDayId)
      }
    })

    setSelectedPlaces([])
    setTargetDayId('')
    loadTrip()
  }

  // Resetear focusedPlace cuando cambia el día seleccionado
  useEffect(() => {
    setFocusedPlace(null)
  }, [selectedDayId])

  if (!trip) {
    return <div className="p-4">Loading...</div>
  }

  // Obtener lugares filtrados según el día seleccionado
  const getFilteredPlaces = () => {
    if (!selectedDayId) {
      // Mostrar todos los lugares
      const allPlaces = trip.days.flatMap(day =>
        day.places.map(place => ({ ...place, color: day.color }))
      )
      return [...allPlaces, ...trip.unassignedPlaces.map(p => ({ ...p, color: '#999999' }))]
    } else if (selectedDayId === 'unassigned') {
      return trip.unassignedPlaces.map(p => ({ ...p, color: '#999999' }))
    } else {
      const day = trip.days.find(d => d.id === selectedDayId)
      return day ? day.places.map(p => ({ ...p, color: day.color })) : []
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="px-2 md:px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1"
        >
          <span>←</span>
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-base md:text-xl font-bold text-gray-800 truncate flex-1">{trip.name}</h1>

        {/* Botón para abrir sidebar en móvil */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          title="View days and places"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mapa */}
        <div className="flex-1 relative">
          <Map
            places={getFilteredPlaces()}
            onPlaceAdded={handlePlaceAdded}
            tripId={tripId}
            focusedPlace={focusedPlace}
          />
        </div>

        {/* Lista de lugares - Desktop (siempre visible) */}
        <div className="hidden md:block w-[380px] bg-white border-l border-gray-200 shadow-lg flex flex-col">
          <PlacesList
            trip={trip}
            selectedDayId={selectedDayId}
            onSelectDay={setSelectedDayId}
            onUpdate={handleDayUpdated}
            onPlaceClick={handlePlaceClick}
            selectedPlaces={selectedPlaces}
            onSelectedPlacesChange={setSelectedPlaces}
            targetDayId={targetDayId}
            onTargetDayIdChange={setTargetDayId}
            onMoveSelected={handleMoveSelected}
          />
        </div>

        {/* Lista de lugares - Mobile (drawer deslizable) */}
        {isSidebarOpen && (
          <>
            {/* Overlay oscuro */}
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Panel deslizable */}
            <div className="md:hidden fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
              {/* Header del drawer */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <h2 className="font-bold text-gray-800">Days & Places</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido */}
              <PlacesList
                trip={trip}
                selectedDayId={selectedDayId}
                onSelectDay={(dayId) => {
                  setSelectedDayId(dayId)
                  setIsSidebarOpen(false)
                }}
                onUpdate={handleDayUpdated}
                onPlaceClick={(place) => {
                  handlePlaceClick(place)
                  setIsSidebarOpen(false)
                }}
                selectedPlaces={selectedPlaces}
                onSelectedPlacesChange={setSelectedPlaces}
                targetDayId={targetDayId}
                onTargetDayIdChange={setTargetDayId}
                onMoveSelected={handleMoveSelected}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
