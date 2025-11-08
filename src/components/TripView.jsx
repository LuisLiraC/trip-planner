import { useState, useEffect } from 'react'
import { getTrip } from '../utils/storage'
import Map from './Map'
import PlacesList from './PlacesList'

export default function TripView({ tripId, onBack }) {
  const [trip, setTrip] = useState(null)
  const [selectedDayId, setSelectedDayId] = useState(null)

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

  if (!trip) {
    return <div className="p-4">Cargando...</div>
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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800">{trip.name}</h1>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mapa */}
        <div className="flex-1 relative">
          <Map
            places={getFilteredPlaces()}
            onPlaceAdded={handlePlaceAdded}
            tripId={tripId}
          />
        </div>

        {/* Lista de lugares */}
        <div className="w-[380px] bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
          <PlacesList
            trip={trip}
            selectedDayId={selectedDayId}
            onSelectDay={setSelectedDayId}
            onUpdate={handleDayUpdated}
          />
        </div>
      </div>
    </div>
  )
}
