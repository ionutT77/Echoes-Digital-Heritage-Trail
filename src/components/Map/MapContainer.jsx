import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import NodeMarker from './NodeMarker';
import UserLocation from './UserLocation';
import useMapStore from '../../stores/mapStore';
import useRouting from '../../hooks/useRouting';
import useGeolocation from '../../hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';

function MapContainer() {
  const mapRef = useRef(null);
  const { error, loading } = useGeolocation();
  const userLocation = useMapStore((state) => state.userLocation);
  const culturalNodes = useMapStore((state) => state.culturalNodes);
  const discoveredNodes = useMapStore((state) => state.discoveredNodes);
  const mapCenter = useMapStore((state) => state.mapCenter);
  const mapZoom = useMapStore((state) => state.mapZoom);
  const setMapCenter = useMapStore((state) => state.setMapCenter);
  const { createRoute, clearRoute } = useRouting(mapRef);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1.5
      });
    }
  }, [userLocation]);

  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1
      });
    }
  };

  const handleFindPath = () => {
    if (!userLocation) {
      return;
    }

    // Get undiscovered nodes
    const undiscoveredNodes = culturalNodes.filter((node) => !discoveredNodes.has(node.id));

    console.log('🗺️ Creating route to', undiscoveredNodes.length, 'undiscovered nodes');
    
    if (undiscoveredNodes.length === 0) {
      alert('Congratulations! You have discovered all nodes!');
      return;
    }

    // Create route through all undiscovered nodes
    const routeCreated = createRoute(userLocation, undiscoveredNodes);
    
    if (routeCreated) {
      console.log('✅ Route creation initiated');
    } else {
      console.error('❌ Failed to create route');
      alert('Failed to create route. Please ensure you have location access.');
    }
  };

  return (
    <div className="relative w-full h-screen">
      <LeafletMap
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        {userLocation && <UserLocation position={userLocation} />}
        {culturalNodes.map((node) => (
          <NodeMarker key={node.id} node={node} />
        ))}
      </LeafletMap>

      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm text-neutral-600">Locating you...</p>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 px-4 py-2 rounded-lg shadow-lg z-[1000] border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {userLocation && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-heritage-50 transition-colors z-[1000]"
          aria-label="Recenter map"
        >
          <Navigation className="w-5 h-5 text-heritage-700" />
        </button>
      )}

      {userLocation && culturalNodes.length > 0 && (
        <div className="absolute bottom-24 left-4 flex flex-col gap-2 z-[1000]">
          <button
            onClick={handleFindPath}
            className="bg-heritage-700 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-heritage-800 transition-colors font-semibold text-sm flex items-center gap-2"
            aria-label="Find my path"
          >
            <Navigation className="w-4 h-4" />
            Find My Path
          </button>
          <button
            onClick={clearRoute}
            className="bg-white text-heritage-700 px-4 py-3 rounded-lg shadow-lg hover:bg-heritage-50 transition-colors font-semibold text-sm border border-heritage-700"
            aria-label="Clear route"
          >
            Clear Route
          </button>
        </div>
      )}
    </div>
  );
}

export default MapContainer;
