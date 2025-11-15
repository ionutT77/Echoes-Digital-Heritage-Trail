import React, { useEffect, useState, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin as MapPinIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import NodeMarker from './NodeMarker';
import UserLocation from './UserLocation';
import useMapStore from '../../stores/mapStore';
import useRouting from '../../hooks/useRouting';
import useGeolocation from '../../hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';

function MapContainer({ mapRef: externalMapRef }) {
  const mapRef = useRef(null);
  const { error, loading } = useGeolocation();
  const userLocation = useMapStore((state) => state.userLocation);
  const culturalNodes = useMapStore((state) => state.culturalNodes);
  const discoveredNodes = useMapStore((state) => state.discoveredNodes);
  const mapCenter = useMapStore((state) => state.mapCenter);
  const mapZoom = useMapStore((state) => state.mapZoom);
  const setMap = useMapStore((state) => state.setMap);
  const setClearRouteFunction = useMapStore((state) => state.setClearRouteFunction);
  const setCreateRouteFunction = useMapStore((state) => state.setCreateRouteFunction);
  const { createRoute, clearRoute } = useRouting(mapRef);

  // Expose map ref to parent if provided
  useEffect(() => {
    if (externalMapRef) {
      externalMapRef.current = mapRef.current;
    }
  }, [externalMapRef]);

  // Store map instance in global store when available
  useEffect(() => {
    if (mapRef.current) {
      setMap(mapRef.current);
    }
  }, [mapRef.current, setMap]);

  // Store clear route function globally
  useEffect(() => {
    if (clearRoute) {
      setClearRouteFunction(clearRoute);
    }
  }, [clearRoute, setClearRouteFunction]);

  // Store create route function globally
  useEffect(() => {
    if (createRoute) {
      setCreateRouteFunction(createRoute);
    }
  }, [createRoute, setCreateRouteFunction]);

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

  const handleFindPath = async () => {
    if (!userLocation) {
      await Swal.fire({
        title: 'Location Required',
        text: 'Please enable location access to plan your route.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    // Get undiscovered nodes
    const undiscoveredNodes = culturalNodes.filter((node) => !discoveredNodes.has(node.id));

    if (undiscoveredNodes.length === 0) {
      await Swal.fire({
        title: 'All Discovered!',
        text: 'Congratulations! You have discovered all cultural nodes!',
        icon: 'success',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    // Ask user for route parameters
    const { value: formValues } = await Swal.fire({
      title: 'Plan Your Route',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-semibold text-neutral-900 mb-2">
              How many locations do you want to visit?
            </label>
            <input 
              id="swal-locations" 
              type="number" 
              min="1" 
              max="${undiscoveredNodes.length}" 
              value="${Math.min(3, undiscoveredNodes.length)}"
              class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
            />
            <p class="text-xs text-neutral-600 mt-1">${undiscoveredNodes.length} undiscovered locations available</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-neutral-900 mb-2">
              How much time do you have? (minutes)
            </label>
            <input 
              id="swal-time" 
              type="number" 
              min="30" 
              max="480" 
              value="90"
              class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
            />
            <p class="text-xs text-neutral-600 mt-1">Includes 10 minutes at each location</p>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#6f4e35',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Create Route',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const locations = parseInt(document.getElementById('swal-locations').value);
        const time = parseInt(document.getElementById('swal-time').value);
        
        if (!locations || locations < 1) {
          Swal.showValidationMessage('Please enter at least 1 location');
          return false;
        }
        
        if (locations > undiscoveredNodes.length) {
          Swal.showValidationMessage(`Maximum ${undiscoveredNodes.length} locations available`);
          return false;
        }
        
        if (!time || time < 30) {
          Swal.showValidationMessage('Please enter at least 30 minutes');
          return false;
        }
        
        return { locations, time };
      }
    });

    if (!formValues) {
      return; // User cancelled
    }

    const { locations: requestedLocations, time: availableTime } = formValues;

    // Calculate how many locations we can fit in the available time
    // Each location gets 10 minutes + walking time estimate (2 min per location average)
    const timePerLocation = 10; // 10 minutes visit time
    const estimatedWalkingTimePerLocation = 2; // rough estimate
    const totalTimePerLocation = timePerLocation + estimatedWalkingTimePerLocation;
    
    const maxLocationsByTime = Math.floor(availableTime / totalTimePerLocation);
    const actualLocations = Math.min(requestedLocations, maxLocationsByTime, undiscoveredNodes.length);

    if (actualLocations < requestedLocations) {
      await Swal.fire({
        title: 'Route Adjusted',
        html: `Based on your available time of ${availableTime} minutes, we can visit <strong>${actualLocations} locations</strong> instead of ${requestedLocations}.<br><br>This includes 10 minutes at each location plus walking time.`,
        icon: 'info',
        confirmButtonColor: '#6f4e35'
      });
    }

    // Select closest nodes to optimize route
    const nodesWithDistance = undiscoveredNodes.map(node => ({
      ...node,
      distance: Math.sqrt(
        Math.pow(node.latitude - userLocation.lat, 2) +
        Math.pow(node.longitude - userLocation.lng, 2)
      )
    }));

    // Sort by distance and take the requested number
    const selectedNodes = nodesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, actualLocations);

    console.log(`🗺️ Creating route to ${selectedNodes.length} locations (${availableTime} min available)`);
    
    // Create route through selected nodes
    const routeCreated = createRoute(userLocation, selectedNodes);
    
    if (routeCreated) {
      console.log('✅ Route creation initiated');
    } else {
      console.error('❌ Failed to create route');
      await Swal.fire({
        title: 'Route Creation Failed',
        text: 'Failed to create route. Please ensure you have location access.',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
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