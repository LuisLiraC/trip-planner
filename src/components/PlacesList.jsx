import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import DayBlock from './DayBlock'
import { addDay, reorderDays, movePlace } from '../utils/storage'
import { Map, MapPin, Plus, CheckSquare, X, MoveRight, Search } from 'lucide-react'

export default function PlacesList({ trip, selectedDayId, onSelectDay, onUpdate, onPlaceClick, selectedPlaces = [], onSelectedPlacesChange, targetDayId = '', onTargetDayIdChange, onMoveSelected }) {
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [newDayTitle, setNewDayTitle] = useState('')
  const [selectionMode, setSelectionMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    setActiveType(event.active.data.current?.type)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    setActiveType(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) return

    // Caso 1: Arrastrar un lugar (place) a un día
    if (activeData.type === 'place') {
      const sourceDayId = activeData.dayId
      let targetDayId = null

      // El droppable ahora siempre es tipo 'day', sin importar si recibe lugares o bloques
      if (overData.type === 'day') {
        targetDayId = overData.dayId
      } else if (overData.type === 'place') {
        targetDayId = overData.dayId
      }

      if (targetDayId && sourceDayId !== targetDayId) {
        movePlace(trip.id, active.id, sourceDayId, targetDayId)
        onUpdate()
      }
    }
    // Caso 2: Reordenar bloques de días (day-block)
    else if (activeData.type === 'day-block') {
      const sourceDayId = activeData.dayId
      let targetDayId = null

      // El droppable es tipo 'day', verificamos que no sea 'unassigned'
      if (overData.type === 'day' && !overData.isUnassigned) {
        targetDayId = overData.dayId
      }

      if (targetDayId && sourceDayId !== targetDayId && sourceDayId !== 'unassigned' && targetDayId !== 'unassigned') {
        reorderDays(trip.id, sourceDayId, targetDayId)
        onUpdate()
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveType(null)
  }

  const handleAddDay = (e) => {
    e.preventDefault()
    if (newDayTitle.trim()) {
      addDay(trip.id, { title: newDayTitle })
      setNewDayTitle('')
      onUpdate()
    }
  }

  const handleToggleSelect = (placeId) => {
    const newSelectedPlaces = selectedPlaces.includes(placeId)
      ? selectedPlaces.filter(id => id !== placeId)
      : [...selectedPlaces, placeId]
    onSelectedPlacesChange(newSelectedPlaces)
  }

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    onSelectedPlacesChange([])
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-3 bg-white">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-gray-800">Days & Places</h2>
          <button
            onClick={handleToggleSelectionMode}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectionMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={selectionMode ? 'Cancel selection' : 'Select multiple places'}
          >
            {selectionMode ? (
              <>
                <X size={16} />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <CheckSquare size={16} />
                <span>Select</span>
              </>
            )}
          </button>
        </div>

        {/* Barra de acción para selección múltiple */}
        {selectionMode && selectedPlaces.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-blue-900">
                {selectedPlaces.length} {selectedPlaces.length === 1 ? 'place selected' : 'places selected'}
              </p>
              <div className="flex gap-2">
                <select
                  value={targetDayId}
                  onChange={(e) => onTargetDayIdChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm bg-white"
                >
                  <option value="">Select destination...</option>
                  <option value="unassigned">Unassigned</option>
                  {trip.days.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.title || 'Untitled day'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onMoveSelected}
                  disabled={!targetDayId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5 disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                  title="Move selected places"
                >
                  <MoveRight size={16} />
                  Move
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario para agregar nuevo día */}
        <form onSubmit={handleAddDay} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDayTitle}
              onChange={(e) => setNewDayTitle(e.target.value)}
              placeholder="E.g.: Day 1 - City center"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!newDayTitle.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Add day"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

        {/* Search places */}
        <div className="relative mb-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter saved places..."
            className="w-full py-2 pl-9 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Área con scroll para los bloques */}
      <div className="flex-1 overflow-y-auto px-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* Bloques de días */}
          {trip.days.map((day) => (
            <DayBlock
              key={day.id}
              day={day}
              tripId={trip.id}
              onUpdate={onUpdate}
              isSelected={selectedDayId === day.id}
              onSelect={onSelectDay}
              onPlaceClick={onPlaceClick}
              selectionMode={selectionMode}
              selectedPlaces={selectedPlaces}
              onToggleSelect={handleToggleSelect}
              searchQuery={searchQuery}
            />
          ))}

          {/* Bloque de lugares sin asignar */}
          <DayBlock
            key="unassigned"
            day={trip.unassignedPlaces}
            tripId={trip.id}
            onUpdate={onUpdate}
            isSelected={selectedDayId === 'unassigned'}
            onSelect={onSelectDay}
            isUnassigned={true}
            onPlaceClick={onPlaceClick}
            selectionMode={selectionMode}
            selectedPlaces={selectedPlaces}
            onToggleSelect={handleToggleSelect}
            searchQuery={searchQuery}
          />

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90 flex items-center gap-2">
                {activeType === 'day-block' ? <Map size={16} className="text-blue-600" /> : <MapPin size={16} className="text-blue-600" />}
                <p className="font-medium text-blue-700 text-sm">
                  {activeType === 'day-block' ? 'Moving block...' : 'Dragging place...'}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Botón para mostrar todos los lugares */}
        {selectedDayId && (
          <button
            onClick={() => onSelectDay(null)}
            className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-md hover:from-blue-100 hover:to-indigo-100 transition-all font-medium text-sm border border-blue-200 flex items-center justify-center gap-2"
          >
            <Map size={16} />
            <span>Show all places</span>
          </button>
        )}
      </div>
    </div>
  )
}
