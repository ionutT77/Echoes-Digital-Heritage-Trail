import React from 'react';
import { useState, useEffect } from 'react';
import MapContainer from '../components/Map/MapContainer';
import NodeModal from '../components/Node/NodeModal';
import AudioPlayer from '../components/Audio/AudioPlayer';
import OnboardingOverlay from '../components/Onboarding/OnboardingOverlay';
import DebugPanel from '../components/Debug/DebugPanel';
import useProximity from '../hooks/useProximity';
import useMapStore from '../stores/mapStore';
import { fetchCulturalNodes } from '../services/nodesService';
import { Bug } from 'lucide-react';

function MapPage() {
  const [showDebug, setShowDebug] = useState(false);
  const setCulturalNodes = useMapStore((state) => state.setCulturalNodes);
  useProximity();

  useEffect(() => {
    async function loadNodes() {
      const nodes = await fetchCulturalNodes();
      setCulturalNodes(nodes);
    }
    loadNodes();
  }, [setCulturalNodes]);

  return (
    <div className="relative">
      <MapContainer />
      <NodeModal />
      <AudioPlayer />
      <OnboardingOverlay />
      
      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-20 right-4 bg-heritage-700 text-white p-3 rounded-full shadow-lg hover:bg-heritage-800 transition-colors z-[2000]"
        aria-label="Toggle debug panel"
      >
        <Bug className="w-5 h-5" />
      </button>

      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
    </div>
  );
}

export default MapPage;