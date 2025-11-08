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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Plane size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Mis Viajes</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={trips.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Exportar todos los viajes"
            >
              <Download size={18} />
              <span>Exportar</span>
            </button>
            <button
              onClick={handleImportClick}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm flex items-center gap-2"
              title="Importar viajes desde archivo"
            >
              <Upload size={18} />
              <span>Importar</span>
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
          <div className="flex gap-3">
            <input
              type="text"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              placeholder="Ej: Viaje a Japón Abril 2026"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Crear Viaje
            </button>
          </div>
        </form>
      </div>

      {/* Lista de viajes */}
      {trips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Plane size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No tienes viajes guardados aún</p>
          <p className="text-gray-400 text-sm mt-2">Crea tu primer viaje usando el formulario arriba</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              {editingId === trip.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(trip.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    <span className="text-sm">Guardar</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-1.5"
                  >
                    <X size={16} />
                    <span className="text-sm">Cancelar</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                      {trip.name}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{trip.days.length} {trip.days.length === 1 ? 'día' : 'días'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
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
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onSelectTrip(trip.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={() => handleStartEdit(trip)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center"
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
