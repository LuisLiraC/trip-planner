import { useState, useEffect, useRef } from 'react'
import { getTrips, createTrip, deleteTrip, updateTrip, exportTrips, importTrips } from '../utils/storage'
import { Plane, MapPin, Calendar, Edit2, Trash2, Check, X, Download, Upload } from 'lucide-react'

export default function TripList({ onSelectTrip }) {
  const [trips, setTrips] = useState([])
  const [newTripName, setNewTripName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = () => {
    const allTrips = getTrips()
    setTrips(allTrips)
  }

  const handleCreateTrip = (e) => {
    e.preventDefault()
    if (newTripName.trim()) {
      createTrip(newTripName)
      setNewTripName('')
      loadTrips()
    }
  }

  const handleDeleteTrip = (id) => {
    if (confirm('¿Estás seguro de eliminar este viaje?')) {
      deleteTrip(id)
      loadTrips()
    }
  }

  const handleStartEdit = (trip) => {
    setEditingId(trip.id)
    setEditingName(trip.name)
  }

  const handleSaveEdit = (id) => {
    if (editingName.trim()) {
      updateTrip(id, { name: editingName })
      setEditingId(null)
      setEditingName('')
      loadTrips()
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleExport = () => {
    try {
      exportTrips()
    } catch (error) {
      console.error(error)
      alert('Error al exportar los viajes')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preguntar si quiere reemplazar o fusionar
    const shouldMerge = confirm(
      '¿Quieres FUSIONAR estos viajes con los existentes?\n\n' +
      'OK = Agregar a los viajes actuales (fusionar)\n' +
      'Cancelar = Reemplazar todos los viajes actuales'
    )

    try {
      const result = await importTrips(file, shouldMerge)
      loadTrips()
      alert(
        `${result.count} viaje(s) importado(s) correctamente.\n\n` +
        `Modo: ${result.mode === 'merge' ? 'Fusionado' : 'Reemplazado'}`
      )
    } catch (error) {
      alert(error.message)
    }

    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = ''
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-0">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <Plane size={24} className="text-blue-600 md:w-8 md:h-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mis Viajes</h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleExport}
              disabled={trips.length === 0}
              className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-1 md:gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              title="Exportar todos los viajes"
            >
              <Download size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={handleImportClick}
              className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm flex items-center gap-1 md:gap-2 text-sm"
              title="Importar viajes desde archivo"
            >
              <Upload size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Formulario para crear nuevo viaje */}
        <form onSubmit={handleCreateTrip}>
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              placeholder="Ej: Viaje a Japón Abril 2026"
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm md:text-base"
            />
            <button
              type="submit"
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm md:text-base whitespace-nowrap"
            >
              Crear Viaje
            </button>
          </div>
        </form>
      </div>

      {/* Lista de viajes */}
      {trips.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Plane size={40} className="mx-auto text-gray-300 mb-4 md:w-12 md:h-12" />
          <p className="text-gray-600 font-medium text-sm md:text-base">No tienes viajes guardados aún</p>
          <p className="text-gray-400 text-xs md:text-sm mt-2 px-4">Crea tu primer viaje usando el formulario arriba</p>
        </div>
      ) : (
        <div className="grid gap-2 md:gap-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              {editingId === trip.id ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(trip.id)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span className="text-sm">Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X size={16} />
                      <span className="text-sm">Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2 truncate">
                      {trip.name}
                    </h3>
                    <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Calendar size={14} />
                        <span>{trip.days.length} {trip.days.length === 1 ? 'día' : 'días'}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <MapPin size={14} />
                        <span>
                          {trip.days.reduce((acc, day) => acc + day.places.length, 0) +
                           trip.unassignedPlaces.length} {
                            (trip.days.reduce((acc, day) => acc + day.places.length, 0) +
                             trip.unassignedPlaces.length) === 1 ? 'lugar' : 'lugares'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end sm:ml-4">
                    <button
                      onClick={() => onSelectTrip(trip.id)}
                      className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={() => handleStartEdit(trip)}
                      className="px-2 md:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="px-2 md:px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
