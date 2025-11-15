import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../components/Map/MapContainer';
import NodeModal from '../components/Node/NodeModal';
import AudioPlayer from '../components/Audio/AudioPlayer';
import OnboardingOverlay from '../components/Onboarding/OnboardingOverlay';
import LanguageSelector from '../components/Map/LanguageSelector';
import DebugPanel from '../components/Debug/DebugPanel';
import useProximity from '../hooks/useProximity';
import useMapStore from '../stores/mapStore';
import { fetchCulturalNodes, fetchUserDiscoveries } from '../services/nodesService';
import { checkAvailableModels } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Plus } from 'lucide-react';

function MapPage() {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);
  const { user } = useAuth();
  const { profile } = useAuth();
  const setCulturalNodes = useMapStore((state) => state.setCulturalNodes);
  const addDiscoveredNode = useMapStore((state) => state.addDiscoveredNode);
  const currentLanguage = useMapStore((state) => state.currentLanguage);
  const setCurrentLanguage = useMapStore((state) => state.setCurrentLanguage);
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
    
    // Check available models on mount (only once)
    checkAvailableModels();
  }, [setCulturalNodes, addDiscoveredNode, user]);

  return (
    <div className="relative">
      <MapContainer />
      <NodeModal />
      <AudioPlayer />
      <OnboardingOverlay />
      
      {/* Language Selector - Bottom left above Find My Path */}
      <div className="absolute bottom-24 left-4 z-[1000]">
        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>
      
      {/* Request Location Button */}
      {/* {user && (
        <button
          onClick={() => navigate('/request-location')}
          className="fixed bottom-24 right-4 bg-heritage-700 text-white px-4 py-3 rounded-full shadow-lg hover:bg-heritage-800 transition-colors z-[2000] flex items-center gap-2"
          aria-label="Request a location"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Request Location</span>
        </button>
      )} */}
      
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