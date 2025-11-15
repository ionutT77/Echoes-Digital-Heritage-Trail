import { create } from 'zustand';

const useMapStore = create((set) => ({
  userLocation: null,
  selectedNode: null,
  discoveredNodes: new Set(),
  culturalNodes: [],
  mapCenter: [45.7489, 21.2087],
  mapZoom: 14,
  map: null,
  setMap: (map) => set({ map: map }),
  setCulturalNodes: (nodes) => set({ culturalNodes: nodes }),
  setUserLocation: (location) => set({ userLocation: location }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  addDiscoveredNode: (nodeId) => set((state) => ({
    discoveredNodes: new Set([...state.discoveredNodes, nodeId])
  })),
  clearDiscoveredNodes: () => set({ discoveredNodes: new Set() }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  clearSelectedNode: () => set({ selectedNode: null }),
}));

export default useMapStore;
