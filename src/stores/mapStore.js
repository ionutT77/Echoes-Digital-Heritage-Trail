import { create } from 'zustand';

const useMapStore = create((set, get) => ({
  userLocation: null,
  selectedNode: null,
  discoveredNodes: new Set(),
  culturalNodes: [],
  mapCenter: [45.7489, 21.2087],
  mapZoom: 14,
  map: null,
  clearRouteFunction: null,
  createRouteFunction: null,
  
  // Translation state
  currentLanguage: 'en',
  translatedNodes: {}, // { nodeId: { language: translatedContent } }
  
  setMap: (map) => set({ map: map }),
  setClearRouteFunction: (fn) => set({ clearRouteFunction: fn }),
  setCreateRouteFunction: (fn) => set({ createRouteFunction: fn }),
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
  
  // Translation methods
  setCurrentLanguage: (language) => set({ currentLanguage: language }),
  
  setTranslatedNode: (nodeId, language, translatedContent) =>
    set((state) => ({
      translatedNodes: {
        ...state.translatedNodes,
        [nodeId]: {
          ...state.translatedNodes[nodeId],
          [language]: translatedContent
        }
      }
    })),
  
  getNodeInLanguage: (nodeId, language) => {
    const state = get();
    if (language === 'en') {
      return state.culturalNodes.find(n => n.id === nodeId);
    }
    return state.translatedNodes[nodeId]?.[language];
  },
}));

export default useMapStore;
