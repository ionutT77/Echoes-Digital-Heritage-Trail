import React from 'react';
import { useState, useEffect, useRef } from 'react';
import MapContainer from '../components/Map/MapContainer';
import NodeModal from '../components/Node/NodeModal';
import AudioPlayer from '../components/Audio/AudioPlayer';
import OnboardingOverlay from '../components/Onboarding/OnboardingOverlay';
import DebugPanel from '../components/Debug/DebugPanel';
import useProximity from '../hooks/useProximity';
import useMapStore from '../stores/mapStore';
import { fetchCulturalNodes, fetchUserDiscoveries } from '../services/nodesService';
import { useAuth } from '../contexts/AuthContext';
import { Bug } from 'lucide-react';

function MapPage() {
  const mapRef = useRef(null);
  const [showDebug, setShowDebug] = useState(false);
  const { user } = useAuth();
  const { profile } = useAuth();
  const setCulturalNodes = useMapStore((state) => state.setCulturalNodes);
  const addDiscoveredNode = useMapStore((state) => state.addDiscoveredNode);
  useProximity();

  useEffect(() => {
    async function loadNodes() {
      const nodes = await fetchCulturalNodes();
      setCulturalNodes(nodes);

      // Load user's discoveries if logged in
      if (user) {
        const discoveredNodeIds = await fetchUserDiscoveries(user.id);
        discoveredNodeIds.forEach((nodeId) => {
          addDiscoveredNode(nodeId);
        });
      }
    }
    loadNodes();
  }, [setCulturalNodes, addDiscoveredNode, user]);

  return (
    <div className="relative">
      <MapContainer />
      <NodeModal />
      <AudioPlayer />
      <OnboardingOverlay />
      
      {/* Debug Toggle Button - Admin Only */}
      {profile?.is_admin && (
        <>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="fixed top-20 right-4 bg-heritage-700 text-white p-3 rounded-full shadow-lg hover:bg-heritage-800 transition-colors z-[2000]"
            aria-label="Toggle debug panel"
          >
            <Bug className="w-5 h-5" />
          </button>
          {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
        </>
      )}
    </div>
  );
}

export default MapPage;