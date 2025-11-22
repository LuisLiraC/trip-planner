# Trip Planner

A simple, free trip planning app to organize your travel itineraries with an interactive map.

**[Live Demo](https://luislirac.github.io/trip-planner)**

## Features

- Create and manage multiple trips
- Search and add places using OpenStreetMap
- Organize places into days/blocks with custom colors
- Drag and drop to reorder days and move places
- Filter places across all days
- Select multiple places to move at once
- Export/import trips as JSON for backup
- Works offline (data stored in localStorage)
- No API keys required

## Tech Stack

- React + Vite
- Leaflet + react-leaflet
- Photon API (Komoot) for place search
- @dnd-kit for drag and drop
- Tailwind CSS
- localStorage for persistence

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## License

MIT
