import { useState } from 'react'
import TripList from './components/TripList'
import TripView from './components/TripView'

function App() {
  const [selectedTripId, setSelectedTripId] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedTripId ? (
        <TripView
          tripId={selectedTripId}
          onBack={() => setSelectedTripId(null)}
        />
      ) : (
        <div className="container mx-auto p-8">
          <TripList onSelectTrip={setSelectedTripId} />
        </div>
      )}
    </div>
  )
}

export default App
