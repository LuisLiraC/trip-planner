import { useState } from 'react'
import { updateDay, deleteDay, deletePlace } from '../utils/storage'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Pencil, Trash2, X, Check, Calendar } from 'lucide-react'

function PlaceItem({ place, dayId, tripId, onUpdate, onPlaceClick, selectionMode, isSelected, onToggleSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: place.id,
    data: {
      type: 'place',
      place,
      dayId
    },
    disabled: selectionMode
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1
  } : undefined

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm('Delete this place?')) {
      deletePlace(tripId, place.id, dayId)
      onUpdate()
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
    if (selectionMode) {
      onToggleSelect?.(place.id)
    } else {
      onPlaceClick?.(place)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!selectionMode ? attributes : {})}
      {...(!selectionMode ? listeners : {})}
      className={`bg-white border rounded-md p-2.5 flex justify-between items-start hover:border-gray-300 hover:shadow-sm transition-all group ${
        selectionMode ? 'cursor-pointer' : 'cursor-move touch-none'
      } ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect?.(place.id)}
          className="mr-2 mt-1 w-4 h-4 flex-shrink-0 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div
        className="flex-1 min-w-0 pr-2 cursor-pointer"
        onClick={handleClick}
      >
        <p className="font-medium text-gray-800 text-sm truncate">{place.name}</p>
        {place.address && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{place.address}</p>
        )}
      </div>
      {!selectionMode && (
        <button
          onClick={handleDelete}
          className="ml-2 w-6 h-6 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete place"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default function DayBlock({ day, tripId, onUpdate, isSelected, onSelect, isUnassigned = false, onPlaceClick, selectionMode, selectedPlaces, onToggleSelect }) {
  const [isEditing, setIsEditing] = useState(false)
  const places = isUnassigned ? day : day.places
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [title, setTitle] = useState(day.title)
  const [date, setDate] = useState(day.date)
  const [color, setColor] = useState(day.color)

  const dayId = isUnassigned ? 'unassigned' : day.id

  // Un solo droppable que maneja tanto lugares como bloques
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${dayId}`,
    data: {
      type: 'day',
      dayId,
      day,
      isUnassigned
    }
  })

  // Para hacer el bloque draggable (mover el bloque completo)
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDraggableRef,
    transform: dragTransform,
    isDragging: isBlockDragging
  } = useDraggable({
    id: `day-block-${dayId}`,
    data: {
      type: 'day-block',
      dayId,
      day,
      isUnassigned
    },
    disabled: isUnassigned || isEditing
  })

  const blockStyle = dragTransform ? {
    transform: `translate3d(${dragTransform.x}px, ${dragTransform.y}px, 0)`,
    opacity: isBlockDragging ? 0.5 : 1
  } : undefined

  const handleSave = () => {
    if (!isUnassigned) {
      updateDay(tripId, day.id, { title, date, color })
      onUpdate()
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Delete this day? Places will be moved to "Unassigned"')) {
      deleteDay(tripId, day.id)
      onUpdate()
    }
  }

  // Función para determinar si el texto debe ser oscuro basado en el color de fondo
  const shouldUseDarkText = (bgColor) => {
    if (!bgColor) return false
    // Convertir hex a RGB
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    // Calcular luminosidad
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6
  }

  const textColorClass = isUnassigned ? 'text-gray-800' : (shouldUseDarkText(color) ? 'text-gray-800' : 'text-white')
  const textOpacityClass = isUnassigned ? 'text-gray-600' : (shouldUseDarkText(color) ? 'text-gray-600' : 'text-white/80')

  // Combinar refs del droppable y draggable en el contenedor principal
  const setAllRefs = (node) => {
    setDraggableRef(node)
    setDroppableRef(node)
  }

  return (
    <div
      ref={setAllRefs}
      style={blockStyle}
      className={`border rounded-lg overflow-hidden mb-3 transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'border-gray-200 shadow-sm'
      } ${isBlockDragging ? 'cursor-grabbing' : ''} ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Header del bloque */}
      <div
        className="px-3 py-2 cursor-pointer relative"
        style={{ backgroundColor: isUnassigned ? '#e5e7eb' : color }}
        onClick={() => onSelect(isUnassigned ? 'unassigned' : day.id)}
      >
        {/* Botón para colapsar/expandir */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(!isCollapsed)
          }}
          className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center ${
            shouldUseDarkText(color) || isUnassigned ? 'bg-black/10 hover:bg-black/20' : 'bg-white/20 hover:bg-white/30'
          } rounded transition-colors`}
        >
          <span className={`text-xs font-bold ${textColorClass}`}>
            {isCollapsed ? '▶' : '▼'}
          </span>
        </button>

        {/* Handle para arrastrar el bloque (solo si no es "Sin asignar" y no está editando) */}
        {!isUnassigned && !isEditing && (
          <div
            {...dragAttributes}
            {...dragListeners}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`text-base ${shouldUseDarkText(color) ? 'text-gray-600 hover:text-gray-800' : 'text-white/70 hover:text-white'}`}>⋮⋮</div>
          </div>
        )}

        <div className="ml-7 mr-7">
          {isEditing && !isUnassigned ? (
            <div onClick={(e) => e.stopPropagation()} className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Day title"
                className="w-full px-3 py-1.5 rounded-md border border-white/40 text-sm text-gray-800 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/60"
                autoFocus
              />

              <div className="flex items-stretch gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/40 bg-white/95">
                  <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none min-w-0"
                  />
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-md cursor-pointer border-2 border-white/50 flex-shrink-0"
                  title="Change color"
                />
                <button
                  onClick={handleSave}
                  className="w-9 h-9 bg-white text-green-600 rounded-md hover:bg-white/90 transition-colors shadow-sm flex items-center justify-center flex-shrink-0"
                  title="Save"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`w-9 h-9 rounded-md transition-colors flex items-center justify-center flex-shrink-0 ${
                    shouldUseDarkText(color) ? 'bg-black/10 hover:bg-black/15 text-gray-800' : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${textColorClass}`}>
                  {isUnassigned ? 'Unassigned' : (title || 'Untitled day')}
                </h3>
                {!isUnassigned && date && (
                  <p className={`text-xs mt-0.5 ${textOpacityClass}`}>
                    {new Date(date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
                <p className={`text-xs mt-0.5 ${textOpacityClass}`}>
                  {Array.isArray(places) ? places.length : 0} {Array.isArray(places) && places.length === 1 ? 'place' : 'places'}
                </p>
              </div>
              {!isUnassigned && (
                <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                      shouldUseDarkText(color) ? 'bg-black/10 hover:bg-black/20 text-gray-700' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-7 h-7 flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista de lugares */}
      <div
        className={`transition-colors bg-gray-50 ${!isCollapsed ? 'p-2.5 space-y-1.5 max-h-96 overflow-y-auto' : 'hidden'}`}
      >
        {Array.isArray(places) && places.length > 0 ? (
          places.map((place) => (
            <PlaceItem
              key={place.id}
              place={place}
              dayId={isUnassigned ? 'unassigned' : day.id}
              tripId={tripId}
              onUpdate={onUpdate}
              onPlaceClick={onPlaceClick}
              selectionMode={selectionMode}
              isSelected={selectedPlaces?.includes(place.id)}
              onToggleSelect={onToggleSelect}
            />
          ))
        ) : (
          <p className="text-sm text-center py-6 text-gray-400">
            {isUnassigned ? 'No unassigned places' : 'Drag places here'}
          </p>
        )}
      </div>
    </div>
  )
}
