const STORAGE_KEY = 'trip-planner-data'

// Obtener todos los viajes del localStorage
export const getTrips = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Guardar todos los viajes en localStorage
export const saveTrips = (trips) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

// Crear un nuevo viaje
export const createTrip = (name) => {
  const trips = getTrips()
  const newTrip = {
    id: Date.now().toString(),
    name,
    createdAt: new Date().toISOString(),
    days: [],
    unassignedPlaces: []
  }
  trips.push(newTrip)
  saveTrips(trips)
  return newTrip
}

// Obtener un viaje por ID
export const getTrip = (id) => {
  const trips = getTrips()
  return trips.find(trip => trip.id === id)
}

// Actualizar un viaje
export const updateTrip = (id, updates) => {
  const trips = getTrips()
  const index = trips.findIndex(trip => trip.id === id)
  if (index !== -1) {
    trips[index] = { ...trips[index], ...updates }
    saveTrips(trips)
    return trips[index]
  }
  return null
}

// Eliminar un viaje
export const deleteTrip = (id) => {
  const trips = getTrips()
  const filtered = trips.filter(trip => trip.id !== id)
  saveTrips(filtered)
}

// Agregar un día/bloque a un viaje
export const addDay = (tripId, dayData) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  const newDay = {
    id: Date.now().toString(),
    title: dayData.title || '',
    date: dayData.date || '',
    color: dayData.color || '#676767',
    places: []
  }

  trip.days.push(newDay)
  updateTrip(tripId, trip)
  return newDay
}

// Actualizar un día/bloque
export const updateDay = (tripId, dayId, updates) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  const dayIndex = trip.days.findIndex(d => d.id === dayId)
  if (dayIndex !== -1) {
    trip.days[dayIndex] = { ...trip.days[dayIndex], ...updates }
    updateTrip(tripId, trip)
    return trip.days[dayIndex]
  }
  return null
}

// Eliminar un día/bloque
export const deleteDay = (tripId, dayId) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  // Mover lugares del día eliminado a "sin asignar"
  const day = trip.days.find(d => d.id === dayId)
  if (day && day.places.length > 0) {
    trip.unassignedPlaces = [...trip.unassignedPlaces, ...day.places]
  }

  trip.days = trip.days.filter(d => d.id !== dayId)
  updateTrip(tripId, trip)
}

// Agregar un lugar
export const addPlace = (tripId, placeData, dayId = null) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  const newPlace = {
    id: Date.now().toString(),
    name: placeData.name,
    lat: placeData.lat,
    lng: placeData.lng,
    address: placeData.address || '',
    placeId: placeData.placeId || null
  }

  if (dayId) {
    const dayIndex = trip.days.findIndex(d => d.id === dayId)
    if (dayIndex !== -1) {
      trip.days[dayIndex].places.push(newPlace)
    }
  } else {
    trip.unassignedPlaces.push(newPlace)
  }

  updateTrip(tripId, trip)
  return newPlace
}

// Mover un lugar entre días/bloques
export const movePlace = (tripId, placeId, sourceDayId, targetDayId) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  let place = null

  // Encontrar y remover el lugar de su ubicación actual
  if (sourceDayId === 'unassigned') {
    const index = trip.unassignedPlaces.findIndex(p => p.id === placeId)
    if (index !== -1) {
      place = trip.unassignedPlaces.splice(index, 1)[0]
    }
  } else {
    const dayIndex = trip.days.findIndex(d => d.id === sourceDayId)
    if (dayIndex !== -1) {
      const placeIndex = trip.days[dayIndex].places.findIndex(p => p.id === placeId)
      if (placeIndex !== -1) {
        place = trip.days[dayIndex].places.splice(placeIndex, 1)[0]
      }
    }
  }

  // Agregar el lugar a su nueva ubicación
  if (place) {
    if (targetDayId === 'unassigned') {
      trip.unassignedPlaces.push(place)
    } else {
      const dayIndex = trip.days.findIndex(d => d.id === targetDayId)
      if (dayIndex !== -1) {
        trip.days[dayIndex].places.push(place)
      }
    }
    updateTrip(tripId, trip)
  }

  return place
}

// Eliminar un lugar
export const deletePlace = (tripId, placeId, dayId = null) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  if (dayId === 'unassigned' || dayId === null) {
    trip.unassignedPlaces = trip.unassignedPlaces.filter(p => p.id !== placeId)
  } else {
    const dayIndex = trip.days.findIndex(d => d.id === dayId)
    if (dayIndex !== -1) {
      trip.days[dayIndex].places = trip.days[dayIndex].places.filter(p => p.id !== placeId)
    }
  }

  updateTrip(tripId, trip)
}

// Reordenar días/bloques
export const reorderDays = (tripId, sourceDayId, targetDayId) => {
  const trip = getTrip(tripId)
  if (!trip) return null

  const sourceIndex = trip.days.findIndex(d => d.id === sourceDayId)
  const targetIndex = trip.days.findIndex(d => d.id === targetDayId)

  if (sourceIndex === -1 || targetIndex === -1) return null

  // Remover el día de su posición original
  const [movedDay] = trip.days.splice(sourceIndex, 1)

  // Insertarlo en la nueva posición
  trip.days.splice(targetIndex, 0, movedDay)

  updateTrip(tripId, trip)
  return trip
}

// Exportar todos los viajes a un archivo JSON
export const exportTrips = () => {
  const trips = getTrips()
  const dataStr = JSON.stringify(trips, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `trip-planner-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Importar viajes desde un archivo JSON
export const importTrips = (file, mergeMode = false) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const importedTrips = JSON.parse(e.target.result)

        // Validar que sea un array
        if (!Array.isArray(importedTrips)) {
          reject(new Error('El archivo no tiene el formato correcto'))
          return
        }

        // Validar que cada viaje tenga la estructura correcta
        for (const trip of importedTrips) {
          if (!trip.id || !trip.name || !trip.days || !trip.unassignedPlaces) {
            reject(new Error('El archivo no tiene el formato correcto'))
            return
          }
        }

        if (mergeMode) {
          // Fusionar con los viajes existentes
          const existingTrips = getTrips()
          const mergedTrips = [...existingTrips, ...importedTrips]
          saveTrips(mergedTrips)
          resolve({ mode: 'merge', count: importedTrips.length })
        } else {
          // Reemplazar todos los viajes
          saveTrips(importedTrips)
          resolve({ mode: 'replace', count: importedTrips.length })
        }
      } catch (error) {
        reject(new Error('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsText(file)
  })
}
