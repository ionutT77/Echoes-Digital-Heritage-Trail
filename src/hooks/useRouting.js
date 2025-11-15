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

    // Limit waypoints to avoid overwhelming API (max 20 nodes for optimization endpoint)
    const maxNodes = 20;
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

    try {
      // Step 1: Use OpenRouteService Optimization API to find the optimal order
      const optimizationUrl = 'https://api.openrouteservice.org/optimization';
      
      // Build jobs (destinations to visit)
      const jobs = limitedNodes.map((node, index) => ({
        id: index + 1,
        service: 600, // 10 minutes per location in seconds
        location: [node.longitude, node.latitude],
        skills: [1]
      }));

      // Build vehicle (starting from user location)
      const vehicle = {
        id: 1,
        profile: 'foot-walking',
        start: [userLocation.lng, userLocation.lat],
        end: [userLocation.lng, userLocation.lat], // Return to start
        skills: [1]
      };

      const optimizationBody = {
        jobs: jobs,
        vehicles: [vehicle],
        options: {
          g: true // Return geometry
        }
      };

      console.log('🔍 Requesting route optimization...');
      const optimizationResponse = await fetch(optimizationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': orsApiKey
        },
        body: JSON.stringify(optimizationBody)
      });

      if (!optimizationResponse.ok) {
        const errorText = await optimizationResponse.text();
        console.error('Optimization API error:', errorText);
        throw new Error(`Optimization API error: ${optimizationResponse.status}`);
      }

      const optimizationData = await optimizationResponse.json();
      console.log('✅ Optimization result:', optimizationData);

      // Extract optimized route
      if (!optimizationData.routes || optimizationData.routes.length === 0) {
        throw new Error('No optimized route found');
      }

      const optimizedRoute = optimizationData.routes[0];
      const orderedSteps = optimizedRoute.steps.filter(step => step.type === 'job');
      
      // Reorder nodes based on optimization
      const orderedNodes = orderedSteps.map(step => {
        const jobId = step.job - 1; // job IDs start at 1
        return limitedNodes[jobId];
      });

      console.log('📍 Optimized order:', orderedNodes.map(n => n.title));

      // Build optimized waypoints
      const waypoints = [
        { lat: userLocation.lat, lng: userLocation.lng },
        ...orderedNodes.map(node => ({ lat: node.latitude, lng: node.longitude }))
      ];

      // Step 2: Get detailed walking directions for the optimized route
      const coordinates = waypoints.map(wp => [wp.lng, wp.lat]);
      const directionsUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
      
      const directionsBody = {
        coordinates: coordinates,
        preference: 'shortest',
        instructions: false
      };

      const directionsResponse = await fetch(directionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': orsApiKey
        },
        body: JSON.stringify(directionsBody)
      });

      if (!directionsResponse.ok) {
        throw new Error(`Directions API error: ${directionsResponse.status}`);
      }

      const data = await directionsResponse.json();

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
      const walkingTimeMin = Math.round(totalDuration / 60);
      const visitTimeMin = orderedNodes.length * 10; // 10 min per location
      const totalTimeMin = walkingTimeMin + visitTimeMin;

      await Swal.fire({
        title: '🎯 Optimized Route Created!',
        html: `
          <div class="text-left space-y-2">
            <p class="text-sm text-green-600 font-semibold mb-2">✓ Route optimized for shortest distance</p>
            <p><strong>Distance:</strong> ${distanceKm} km walking route</p>
            <p><strong>Walking time:</strong> ${walkingTimeMin} minutes</p>
            <p><strong>Visit time:</strong> ${visitTimeMin} minutes (10 min per location)</p>
            <p class="text-lg font-bold text-heritage-700 mt-3">Total time: ${totalTimeMin} minutes</p>
            <p class="text-sm text-neutral-600 mt-2">Visiting ${orderedNodes.length} location${orderedNodes.length !== 1 ? 's' : ''} in optimal order</p>
            <div class="mt-3 text-xs text-neutral-500">
              <p class="font-semibold mb-1">Route order:</p>
              <ol class="list-decimal pl-5">
                ${orderedNodes.map(node => `<li>${node.title}</li>`).join('')}
              </ol>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#6f4e35',
        timer: 8000,
        timerProgressBar: true
      });

      // Fit map to route bounds
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 16
      });

      return true;

    } catch (error) {
      console.error('❌ Route optimization failed:', error);
      
      // Fallback: Use nearest neighbor algorithm for optimization
      console.log('🔄 Falling back to nearest neighbor algorithm...');
      return await createFallbackOptimizedRoute(userLocation, limitedNodes, map);
    }
  }, []);

  // Fallback optimization using Nearest Neighbor algorithm
  const createFallbackOptimizedRoute = async (userLocation, nodes, map) => {
    if (!map || !userLocation || !nodes.length) {
      return false;
    }

    // Import distance calculation
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    };

    // Nearest Neighbor TSP approximation
    const optimizeNodeOrder = (startLat, startLon, nodesList) => {
      const unvisited = [...nodesList];
      const ordered = [];
      let currentLat = startLat;
      let currentLon = startLon;

      while (unvisited.length > 0) {
        // Find nearest unvisited node
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
          const distance = calculateDistance(
            currentLat,
            currentLon,
            unvisited[i].latitude,
            unvisited[i].longitude
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        }

        // Add nearest node to ordered list
        const nearestNode = unvisited.splice(nearestIndex, 1)[0];
        ordered.push(nearestNode);
        currentLat = nearestNode.latitude;
        currentLon = nearestNode.longitude;
      }

      return ordered;
    };

    // Optimize node order
    const orderedNodes = optimizeNodeOrder(userLocation.lat, userLocation.lng, nodes);
    console.log('📍 Fallback optimized order:', orderedNodes.map(n => n.title));

    // Build waypoints
    const waypoints = [
      { lat: userLocation.lat, lng: userLocation.lng },
      ...orderedNodes.map(node => ({ lat: node.latitude, lng: node.longitude }))
    ];

    // Try to get real walking routes, fallback to straight lines if needed
    const orsApiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
    
    if (orsApiKey) {
      try {
        const coordinates = waypoints.map(wp => [wp.lng, wp.lat]);
        const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': orsApiKey
          },
          body: JSON.stringify({
            coordinates: coordinates,
            preference: 'shortest'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const feature = data.features[0];
          const routeCoordinates = feature.geometry.coordinates;
          const polyline = routeCoordinates.map(coord => [coord[1], coord[0]]);
          
          // Draw route
          routeLayerRef.current = L.polyline(polyline, {
            color: '#6f4e35',
            weight: 6,
            opacity: 0.8
          }).addTo(map);

          // Add markers
          addRouteMarkers(waypoints, map);

          // Calculate totals
          const totalDistance = feature.properties?.summary?.distance || 0;
          const totalDuration = feature.properties?.summary?.duration || 0;
          const distanceKm = (totalDistance / 1000).toFixed(1);
          const walkingTimeMin = Math.round(totalDuration / 60);
          const visitTimeMin = orderedNodes.length * 10;
          const totalTimeMin = walkingTimeMin + visitTimeMin;

          await Swal.fire({
            title: '✓ Optimized Route Created!',
            html: `
              <div class="text-left space-y-2">
                <p class="text-sm text-blue-600 font-semibold mb-2">Using nearest-neighbor optimization</p>
                <p><strong>Distance:</strong> ${distanceKm} km</p>
                <p><strong>Walking time:</strong> ${walkingTimeMin} min</p>
                <p><strong>Visit time:</strong> ${visitTimeMin} min</p>
                <p class="text-lg font-bold text-heritage-700 mt-3">Total: ${totalTimeMin} min</p>
                <p class="text-sm text-neutral-600 mt-2">${orderedNodes.length} locations</p>
                <div class="mt-3 text-xs text-neutral-500">
                  <p class="font-semibold mb-1">Route order:</p>
                  <ol class="list-decimal pl-5">
                    ${orderedNodes.map(node => `<li>${node.title}</li>`).join('')}
                  </ol>
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#6f4e35',
            timer: 7000,
            timerProgressBar: true
          });

          // Fit bounds
          const bounds = L.latLngBounds(polyline);
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });

          return true;
        }
      } catch (err) {
        console.error('Fallback route API failed:', err);
      }
    }

    // Ultimate fallback: straight lines
    createSimplePath(waypoints, orderedNodes);
    return true;
  };

  // Helper function to add route markers
  const addRouteMarkers = (waypoints, map) => {
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
  };

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
  function createSimplePath(waypoints, orderedNodes = null) {
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
    addRouteMarkers(waypoints, map);

    // Calculate approximate distance
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lat1, lng1] = coordinates[i];
      const [lat2, lng2] = coordinates[i + 1];
      // Haversine formula
      const R = 6371e3;
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lng2 - lng1) * Math.PI) / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    const distanceKm = (totalDistance / 1000).toFixed(1);
    const walkingTimeMin = Math.round(totalDistance / 1.4); // ~1.4 m/s walking speed
    const visitTimeMin = (waypoints.length - 1) * 10;
    const totalTimeMin = walkingTimeMin + visitTimeMin;

    Swal.fire({
      title: 'Simple Route Created',
      html: `
        <div class="text-left space-y-2">
          <p class="text-sm text-neutral-600 mb-2">Using straight-line approximation</p>
          <p><strong>Approx. distance:</strong> ${distanceKm} km</p>
          <p><strong>Est. walking time:</strong> ${walkingTimeMin} min</p>
          <p><strong>Visit time:</strong> ${visitTimeMin} min</p>
          <p class="text-lg font-bold text-heritage-700 mt-3">Total: ~${totalTimeMin} min</p>
          ${orderedNodes ? `
            <div class="mt-3 text-xs text-neutral-500">
              <p class="font-semibold mb-1">Route order:</p>
              <ol class="list-decimal pl-5">
                ${orderedNodes.map(node => `<li>${node.title}</li>`).join('')}
              </ol>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#6f4e35',
      timer: 6000,
      timerProgressBar: true
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