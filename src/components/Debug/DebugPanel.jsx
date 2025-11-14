import React from 'react';
import { X } from 'lucide-react';
import useMapStore from '../../stores/mapStore';
import { calculateDistance } from '../../utils/distance';
import culturalNodes from '../../data/culturalNodes.json';

function DebugPanel({ onClose }) {
  const userLocation = useMapStore((state) => state.userLocation);
  const discoveredNodes = useMapStore((state) => state.discoveredNodes);

  return (
    <div className="fixed top-20 right-4 bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full z-[2500] border-2 border-heritage-700 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-heritage-200">
        <h3 className="font-bold text-heritage-900">🐛 Debug Panel</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-heritage-100 rounded-full transition-colors"
          aria-label="Close debug panel"
        >
          <X className="w-4 h-4 text-heritage-700" />
        </button>
      </div>

      <div className="space-y-4">
        {/* User Location */}
        <div className="bg-heritage-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm text-heritage-900 mb-2">📍 Your GPS Location</h4>
          {userLocation ? (
            <div className="text-xs space-y-1">
              <p className="font-mono"><strong>Lat:</strong> {userLocation.lat.toFixed(6)}</p>
              <p className="font-mono"><strong>Lng:</strong> {userLocation.lng.toFixed(6)}</p>
              <p className="font-mono"><strong>Accuracy:</strong> ±{userLocation.accuracy?.toFixed(0) || 'N/A'}m</p>
              <p className="text-green-600 font-semibold">✅ Location Active</p>
            </div>
          ) : (
            <p className="text-xs text-red-600 font-semibold">❌ No location detected</p>
          )}
        </div>

        {/* Discovered Nodes */}
        <div className="bg-amber-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm text-heritage-900 mb-2">🏆 Discovered Nodes</h4>
          <p className="text-xs">
            <strong>{discoveredNodes.size}</strong> of <strong>{culturalNodes.length}</strong> nodes discovered
          </p>
          {discoveredNodes.size > 0 && (
            <div className="mt-2 space-y-1">
              {Array.from(discoveredNodes).map((nodeId) => {
                const node = culturalNodes.find((n) => n.id === nodeId);
                return (
                  <p key={nodeId} className="text-xs text-green-700">
                    ✓ {node?.title || nodeId}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Proximity to Each Node */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm text-heritage-900 mb-2">📏 Distance to Nodes</h4>
          {userLocation ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {culturalNodes.map((node) => {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  node.latitude,
                  node.longitude
                );
                const isWithinRange = distance <= node.proximityRadius;
                const isDiscovered = discoveredNodes.has(node.id);

                return (
                  <div
                    key={node.id}
                    className={`text-xs p-2 rounded ${
                      isWithinRange ? 'bg-green-100 border border-green-400' : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <p className="font-semibold text-neutral-900 mb-1">{node.title}</p>
                    <p className="font-mono">
                      <strong>Distance:</strong> {distance}m
                    </p>
                    <p className="font-mono">
                      <strong>Radius:</strong> {node.proximityRadius}m
                    </p>
                    <p className="font-semibold mt-1">
                      {isWithinRange ? (
                        <span className="text-green-700">✅ IN RANGE</span>
                      ) : (
                        <span className="text-red-700">❌ TOO FAR</span>
                      )}
                    </p>
                    <p className="font-semibold">
                      {isDiscovered ? (
                        <span className="text-green-700">🏆 Discovered</span>
                      ) : (
                        <span className="text-neutral-600">🔒 Locked</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-600">Waiting for GPS location...</p>
          )}
        </div>

        {/* Node Coordinates */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm text-heritage-900 mb-2">🗺️ Node Coordinates</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {culturalNodes.map((node) => (
              <div key={node.id} className="text-xs p-2 bg-white rounded border border-neutral-200">
                <p className="font-semibold text-neutral-900">{node.title}</p>
                <p className="font-mono text-neutral-700">
                  {node.latitude.toFixed(6)}, {node.longitude.toFixed(6)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebugPanel;
