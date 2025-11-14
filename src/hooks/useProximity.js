import { useState, useEffect, useRef } from 'react';
import { isWithinProximity } from '../utils/distance';
import useMapStore from '../stores/mapStore';
import culturalNodes from '../data/culturalNodes.json';

function useProximity() {
  const userLocation = useMapStore((state) => state.userLocation);
  const addDiscoveredNode = useMapStore((state) => state.addDiscoveredNode);
  const [nearbyNodes, setNearbyNodes] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userLocation) {
      // Clear interval if no location
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Function to check proximity
    const checkProximity = () => {
      console.log("Checking proximity at:", new Date().toLocaleTimeString());
      
      // Get fresh state
      const currentDiscoveredNodes = useMapStore.getState().discoveredNodes;
      
      const nearby = culturalNodes.filter((node) => {
        const isNear = isWithinProximity(
          userLocation.lat,
          userLocation.lng,
          node.latitude,
          node.longitude,
          node.proximityRadius
        );

        if (isNear) {
          const wasDiscovered = currentDiscoveredNodes.has(node.id);
          if (!wasDiscovered) {
            console.log("🎉 NEW NODE DISCOVERED:", node.title);
            addDiscoveredNode(node.id);
            
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        }

        return isNear;
      });

      setNearbyNodes(nearby);
    };

    // Initial check
    checkProximity();

    // Set up 10-second interval
    intervalRef.current = setInterval(checkProximity, 10000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userLocation, addDiscoveredNode]);

  return nearbyNodes;
}

export default useProximity;