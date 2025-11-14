import { create } from 'zustand';
import culturalNodes from '../data/culturalNodes.json';

const useMapStore = create((set) => ({
  userLocation: null,
  selectedNode: null,
  discoveredNodes: new Set(),
  mapCenter: [45.7489, 21.2087],
  mapZoom: 14,
  setUserLocation: (location) => set({ userLocation: location }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  addDiscoveredNode: (nodeId) => set((state) => ({
    discoveredNodes: new Set([...state.discoveredNodes, nodeId])
  })),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  clearSelectedNode: () => set({ selectedNode: null }),
}));

export default useMapStore;
