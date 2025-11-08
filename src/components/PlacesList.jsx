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
import { addDay, movePlace, reorderDays } from '../utils/storage'
import { Map, MapPin, Plus } from 'lucide-react'

export default function PlacesList({ trip, selectedDayId, onSelectDay, onUpdate }) {
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [newDayTitle, setNewDayTitle] = useState('')

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

    if (!activeData) return

    // Caso 1: Arrastrar un lugar (place) a un día
    if (activeData.type === 'place') {
      const sourceDayId = activeData.dayId
      let targetDayId = null

      if (overData?.type === 'day') {
        targetDayId = overData.dayId
      } else if (overData?.type === 'place') {
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

      if (overData?.type === 'day-block') {
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3">
        <h2 className="text-base font-bold text-gray-800 mb-3 px-1">Días y Lugares</h2>

        {/* Formulario para agregar nuevo día */}
        <form onSubmit={handleAddDay} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDayTitle}
              onChange={(e) => setNewDayTitle(e.target.value)}
              placeholder="Ej: Día 1 - Centro de la ciudad"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!newDayTitle.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Agregar día"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

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
          />

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90 flex items-center gap-2">
                {activeType === 'day-block' ? <Map size={16} className="text-blue-600" /> : <MapPin size={16} className="text-blue-600" />}
                <p className="font-medium text-blue-700 text-sm">
                  {activeType === 'day-block' ? 'Moviendo bloque...' : 'Arrastrando lugar...'}
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
            <span>Mostrar todos los lugares</span>
          </button>
        )}
      </div>
    </div>
  )
}
