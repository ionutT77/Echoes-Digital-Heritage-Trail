# Echoes: Digital Heritage Trail - 48h MVP
# Echoes: Timișoara Digital Heritage Trail

A mobile-first progressive web app that guides users through Timișoara's cultural heritage using GPS-triggered content. As users walk through Romania's first free city, they unlock geo-located audio stories, historic images, and fascinating historical details about iconic landmarks.

## Features

### Current (48h MVP)
- ✅ Interactive map with OpenStreetMap tiles
- ✅ Beautiful homepage with brown/earth color theme
- ✅ Interactive map centered on Timișoara, Romania
- ✅ GPS-based geolocation tracking
- ✅ 8 pre-loaded Timișoara cultural nodes with rich content
- ✅ Proximity-based content unlocking (100m radius)
- ✅ Audio player with playback controls
- ✅ Historic images and detailed descriptions
- ✅ Node discovery tracking
- ✅ Interactive onboarding tutorial
- ✅ Admin dashboard for creating nodes
- ✅ Responsive mobile-first design
- ✅ PWA-ready (offline capability in progress)

### Technology Stack
- **Frontend**: React 18 + Vite
- **Maps**: Leaflet + React Leaflet
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Relume UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: SweetAlert2

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Testing on Mobile
The app is designed for mobile devices. To test:
1. Run `npm run dev`
2. Note the network URL (e.g., `http://192.168.1.x:5173`)
3. Open this URL on your mobile device
4. Allow location permissions when prompted

### Simulating Location (Desktop)
Use Chrome DevTools to simulate GPS:
1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "sensors" and select "Show Sensors"
 Set location to Timișoara: 45.7489, 21.2087

## Project Structure

```
src/
├── components/
│   ├── Map/
│   │   ├── MapContainer.jsx      # Main map component
│   │   ├── NodeMarker.jsx        # Cultural node pins
│   │   └── UserLocation.jsx      # User position indicator
│   ├── Node/
│   │   └── NodeModal.jsx         # Node detail popup
│   ├── Audio/
│   │   └── AudioPlayer.jsx       # Audio playback controls
│   ├── Onboarding/
│   │   └── OnboardingOverlay.jsx # First-time tutorial
│   └── Header/
│       └── Header.jsx            # App navigation
├── pages/
│   ├── MapPage.jsx               # Main map view
│   └── AdminPage.jsx             # Node creation dashboard
├── stores/
│   ├── mapStore.js               # Map state (Zustand)
│   └── audioStore.js             # Audio player state
├── hooks/
│   ├── useGeolocation.js         # GPS tracking hook
│   └── useProximity.js           # Proximity detection
├── utils/
│   ├── distance.js               # Haversine calculations
│   └── permissions.js            # Location permissions
├── data/
│   └── culturalNodes.json        # Cultural heritage data
└── App.jsx                       # Root component
```

## Cultural Nodes

The app includes 8 pre-loaded Timișoara cultural heritage nodes:
 **Victory Square (Piața Victoriei)** - Heart of Timișoara with Metropolitan Cathedral
 **Union Square (Piața Unirii)** - Baroque architectural ensemble
 **Huniade Castle** - 15th-century castle, oldest monument in Timișoara
 **Liberty Square (Piața Libertății)** - Site of 1989 Revolution events
 **Timișoara Orthodox Cathedral** - Impressive religious landmark with 11 towers
 **Revolution Memorial (1989)** - Honoring heroes of the anti-communist revolution
 **Bega Canal** - 18th-century engineering achievement
 **Roses Park (Parcul Rozelor)** - Beautiful park with over 1,000 rose varieties

## Adding New Nodes

### Via Admin Dashboard
1. Navigate to `/admin`
2. Fill in the form with node details
3. Copy the generated JSON
4. Add to `src/data/culturalNodes.json`

### Manual Addition
Edit `src/data/culturalNodes.json`:
```json
{
  "id": "node-009",
  "title": "Your Location",
  "latitude": 40.7500,
  "longitude": -73.9900,
  "proximityRadius": 100,
  "description": "Historical description...",
  "historicalPeriod": "1900-1950",
  "category": "Architecture",
  "audioUrl": "/audio/story.mp3",
  "audioDuration": 120,
  "primaryImageUrl": "https://images.unsplash.com/...",
  "images": [...]
}
```

## Next Steps (V1 Roadmap)

### Backend Integration
- [ ] Supabase database setup
- [ ] User authentication
- [ ] Cloud storage for audio/images
- [ ] Real-time node updates

### Enhanced Features
- [ ] AI-generated audio narrations (ElevenLabs)
- [ ] Multiple narrative styles
- [ ] Curated walking routes
- [ ] User progress tracking
- [ ] Achievement badges
- [ ] Community contributions

### PWA Enhancements
- [ ] Complete offline support
- [ ] Background audio playback
- [ ] Push notifications for nearby nodes
- [ ] App manifest optimization

## License
MIT

## Credits
Built with vibecoding excellence for Timișoara by Biela.dev, powered by TeachMeCode® Institute.
