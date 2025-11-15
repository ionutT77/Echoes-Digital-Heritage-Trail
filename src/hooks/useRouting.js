import { useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import Swal from 'sweetalert2';
import useMapStore from '../stores/mapStore';

function useRouting(mapRef) {
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    return () => {
      clearRoute();
    };
  }, []);

  const createRoute = useCallback(async (userLocation, nodes) => {
    // Get the actual map instance from the store if mapRef is not available
    const map = mapRef.current || useMapStore.getState().map;
    if (!map) {
      return false;
    }
    if (!userLocation) {
      return false;
    }
    if (!nodes.length) {
      return false;
    }

    const orsApiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
    if (!orsApiKey) {
      await Swal.fire({
        title: 'API Key Missing',
        text: 'Please add your OpenRouteService API key to the .env file as VITE_OPENROUTESERVICE_API_KEY',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
      return false;
    }

    // Clear existing route
    clearRoute();

    // Limit waypoints to avoid overwhelming API (max 5 nodes + user location)
    const maxNodes = 5;
    const limitedNodes = nodes.length > maxNodes ? nodes.slice(0, maxNodes) : nodes;
    if (nodes.length > maxNodes) {
      await Swal.fire({
        title: 'Route Optimized',
        text: `Showing route to the nearest ${maxNodes} nodes. Discover these first!`,
        icon: 'info',
        confirmButtonColor: '#6f4e35',
        timer: 3000
      });
    }

    // Build waypoints for OpenRouteService
    const waypoints = [
      { lat: userLocation.lat, lng: userLocation.lng },
      ...limitedNodes.map(node => ({ lat: node.latitude, lng: node.longitude }))
    ];

    try {
      // Build OpenRouteService API request for pedestrian routing
      const coordinates = waypoints.map(wp => [wp.lng, wp.lat]); // ORS uses [lng, lat] format
      const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
      
      const requestBody = {
        coordinates: coordinates,
        preference: 'shortest', // Optimize for shortest walking distance
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': orsApiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`OpenRouteService API error: ${response.status}`);
      }

      const data = await response.json();

      // GeoJSON FeatureCollection format
      if (!data.features || data.features.length === 0) {
        throw new Error('No routes found');
      }

      const feature = data.features[0];
      
      // Check if geometry exists - GeoJSON feature format
      if (!feature.geometry || !feature.geometry.coordinates) {
        throw new Error('Invalid route geometry in response');
      }
      
      const routeCoordinates = feature.geometry.coordinates;
      const polyline = routeCoordinates.map(coord => [coord[1], coord[0]]);
       
      // Draw route on map
      routeLayerRef.current = L.polyline(polyline, {
        color: '#6f4e35',
        weight: 6,
        opacity: 0.8
      }).addTo(map);

      // Add markers for waypoints
      waypoints.forEach((waypoint, i) => {
        const isStart = i === 0;
        let markerIcon;
        if (isStart) {
          markerIcon = L.divIcon({
            className: 'custom-route-marker',
            html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
        } else {
          markerIcon = L.divIcon({
            className: 'custom-route-marker',
            html: `<div style="background-color: #8b6441; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${i}</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
        }

        const marker = L.marker([waypoint.lat, waypoint.lng], {
          icon: markerIcon
        }).addTo(map);
        markersRef.current.push(marker);
      });

      // Calculate total distance and duration from OpenRouteService response
      const totalDistance = feature.properties?.summary?.distance || 0; // in meters
      const totalDuration = feature.properties?.summary?.duration || 0; // in seconds
      const distanceKm = (totalDistance / 1000).toFixed(1);
      const timeMin = Math.round(totalDuration / 60);

      await Swal.fire({
        title: 'Route Created!',
        html: `<strong>${distanceKm} km</strong> walking route<br>Estimated time: <strong>${timeMin} minutes</strong>`,
        icon: 'success',
        confirmButtonColor: '#6f4e35',
        timer: 3000
      });

      // Fit map to route bounds
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 16
      });

      return true;

    } catch (error) {
      // Fallback to simple straight-line path
      await Swal.fire({
        title: 'Using Simple Route',
        text: 'Created direct path to nodes (routing service unavailable)',
        icon: 'info',
        confirmButtonColor: '#6f4e35',
        timer: 2500
      });

      createSimplePath(waypoints);
      return true;
    }
  }, []);

  const clearRoute = useCallback(() => {
    const map = mapRef.current || useMapStore.getState().map;
    if (routeLayerRef.current && map) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    markersRef.current.forEach(marker => {
      if (map) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = [];
  }, []);

  // Fallback: Create simple straight-line path
  function createSimplePath(waypoints) {
    const map = mapRef.current || useMapStore.getState().map;
    if (!map) return;
    
    const coordinates = waypoints.map(w => [w.lat, w.lng]);
    routeLayerRef.current = L.polyline(coordinates, {
      color: '#6f4e35',
      weight: 6,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map);

    // Add markers
    waypoints.forEach((waypoint, i) => {
      const isStart = i === 0;
      let markerIcon;
      if (isStart) {
        markerIcon = L.divIcon({
          className: 'custom-route-marker',
          html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
      } else {
        markerIcon = L.divIcon({
          className: 'custom-route-marker',
          html: `<div style="background-color: #8b6441; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${i}</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
      }

      const marker = L.marker([waypoint.lat, waypoint.lng], {
        icon: markerIcon
      }).addTo(map);
      markersRef.current.push(marker);
    });

    // Fit map to show all waypoints
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 16
    });
  }

  return {
    createRoute,
    clearRoute
  };
}

export default useRouting;