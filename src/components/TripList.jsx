import { useState, useEffect, useRef } from 'react'
import { getTrips, createTrip, deleteTrip, updateTrip, exportTrips, importTrips } from '../utils/storage'
import { Plane, MapPin, Calendar, Edit2, Trash2, Check, X, Download, Upload, GitMerge, Replace, AlertTriangle, CheckCircle, XCircle, HelpCircle, Search, GripVertical, MousePointer } from 'lucide-react'

export default function TripList({ onSelectTrip }) {
  const [trips, setTrips] = useState([])
  const [newTripName, setNewTripName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [importModal, setImportModal] = useState({ show: false, file: null })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null })
  const [showHelp, setShowHelp] = useState(false)
  const fileInputRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

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
    setConfirmModal({
      show: true,
      title: 'Delete Trip',
      message: 'Are you sure you want to delete this trip? This action cannot be undone.',
      onConfirm: () => {
        deleteTrip(id)
        loadTrips()
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
        showToast('Trip deleted successfully')
      }
    })
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
      showToast('Trips exported successfully')
    } catch (error) {
      console.error(error)
      showToast('Error exporting trips', 'error')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show modal to choose import mode
    setImportModal({ show: true, file })

    // Clear input to allow selecting the same file again
    e.target.value = ''
  }

  const handleImportConfirm = async (shouldMerge) => {
    const { file } = importModal
    setImportModal({ show: false, file: null })

    if (!file) return

    try {
      const result = await importTrips(file, shouldMerge)
      loadTrips()
      showToast(`${result.count} trip(s) imported successfully!`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleImportCancel = () => {
    setImportModal({ show: false, file: null })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-0">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <Plane size={24} className="text-blue-600 md:w-8 md:h-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Trips</h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleExport}
              disabled={trips.length === 0}
              className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-1 md:gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              title="Export all trips"
            >
              <Download size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleImportClick}
              className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm flex items-center gap-1 md:gap-2 text-sm"
              title="Import trips from file"
            >
              <Upload size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Import</span>
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

        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
        >
          <HelpCircle size={15} />
          <span>How to use</span>
        </button>

        {/* Formulario para crear nuevo viaje */}
        <form onSubmit={handleCreateTrip}>
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              placeholder="E.g.: Japan Trip April 2026"
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm md:text-base"
            />
            <button
              type="submit"
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm md:text-base whitespace-nowrap"
            >
              Create Trip
            </button>
          </div>
        </form>
      </div>

      {/* Lista de viajes */}
      {trips.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Plane size={40} className="mx-auto text-gray-300 mb-4 md:w-12 md:h-12" />
          <p className="text-gray-600 font-medium text-sm md:text-base">You don't have any saved trips yet</p>
          <p className="text-gray-400 text-xs md:text-sm mt-2 px-4">Create your first trip using the form above</p>
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
                      <span className="text-sm">Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X size={16} />
                      <span className="text-sm">Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col sm:flex-row justify-between gap-3 cursor-pointer"
                  onClick={() => onSelectTrip(trip.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2 truncate">
                      {trip.name}
                    </h3>
                    <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Calendar size={14} />
                        <span>{trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <MapPin size={14} />
                        <span>
                          {trip.days.reduce((acc, day) => acc + day.places.length, 0) +
                           trip.unassignedPlaces.length} {
                            (trip.days.reduce((acc, day) => acc + day.places.length, 0) +
                             trip.unassignedPlaces.length) === 1 ? 'place' : 'places'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end sm:ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleStartEdit(trip)}
                      className="px-2 md:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="px-2 md:px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center"
                      title="Delete"
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

      {/* Import Modal */}
      {importModal.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleImportCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Import Trips</h3>
              <p className="text-gray-600 text-sm mb-6">
                How would you like to import the trips from this file?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleImportConfirm(true)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <GitMerge size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Merge</p>
                      <p className="text-xs text-gray-500">Add to your existing trips</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleImportConfirm(false)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Replace size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Replace</p>
                      <p className="text-xs text-gray-500">Delete all current trips and import</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleImportCancel}
                className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirm Modal */}
      {confirmModal.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{confirmModal.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {toast.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-400">
          Created by{' '}
          <a
            href="https://github.com/LuisLiraC"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
          >
            Luis Lira
          </a>
        </p>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowHelp(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle size={22} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">How to use Trip Planner</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Plane size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Create a trip</p>
                    <p className="text-gray-600 mt-0.5">Enter a name and click "Create Trip" to start planning</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Search size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Add places</p>
                    <p className="text-gray-600 mt-0.5">Search for places on the map or click anywhere to add a custom location</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Organize by days</p>
                    <p className="text-gray-600 mt-0.5">Create days/blocks with custom colors and drag places between them</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <GripVertical size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Reorder & filter</p>
                    <p className="text-gray-600 mt-0.5">Drag days to reorder. Use "Filter saved places" to quickly find and move places between days</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <MousePointer size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">View on map</p>
                    <p className="text-gray-600 mt-0.5">Click on any saved place to see it highlighted on the map</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Download size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Backup your data</p>
                    <p className="text-gray-600 mt-0.5">Export trips to a JSON file. Import them anytime to restore or merge</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Got it!
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
