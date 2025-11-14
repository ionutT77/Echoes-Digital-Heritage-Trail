import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import NodeMarker from './NodeMarker';
import UserLocation from './UserLocation';
import useMapStore from '../../stores/mapStore';
import useGeolocation from '../../hooks/useGeolocation';
import culturalNodes from '../../data/culturalNodes.json';
import 'leaflet/dist/leaflet.css';

function MapContainer() {
  const mapRef = useRef(null);
  const { error, loading } = useGeolocation();
  const userLocation = useMapStore((state) => state.userLocation);
  const mapCenter = useMapStore((state) => state.mapCenter);
  const mapZoom = useMapStore((state) => state.mapZoom);
  const setMapCenter = useMapStore((state) => state.setMapCenter);

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
    </div>
  );
}

export default MapContainer;
