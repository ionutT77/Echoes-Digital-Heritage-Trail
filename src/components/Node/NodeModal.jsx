import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Tag, Play, Pause } from 'lucide-react';
import useMapStore from '../../stores/mapStore';
import useAudioStore from '../../stores/audioStore';

function NodeModal() {
  const selectedNode = useMapStore((state) => state.selectedNode);
  const clearSelectedNode = useMapStore((state) => state.clearSelectedNode);
  const discoveredNodes = useMapStore((state) => state.discoveredNodes);
  const userLocation = useMapStore((state) => state.userLocation);
  const currentNode = useAudioStore((state) => state.currentNode);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const playAudio = useAudioStore((state) => state.playAudio);
  const pauseAudio = useAudioStore((state) => state.pauseAudio);

  useEffect(() => {
    if (selectedNode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedNode]);

  if (!selectedNode) return null;

  const isDiscovered = discoveredNodes.has(selectedNode.id);
  const isCurrentlyPlaying = currentNode?.id === selectedNode.id && isPlaying;

  const handleAudioToggle = () => {
    if (isCurrentlyPlaying) {
      pauseAudio();
    } else {
      playAudio(selectedNode);
    }
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[2000]"
            onClick={clearSelectedNode}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[2001] max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-neutral-200 flex items-center justify-between rounded-t-3xl z-10">
              <h3 className="text-lg font-semibold text-neutral-900">
                {selectedNode.title}
              </h3>
              <button
                onClick={clearSelectedNode}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <div className="p-6">
              {selectedNode.primaryImageUrl && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedNode.primaryImageUrl}
                    alt={selectedNode.title}
                    className="w-full h-full object-cover"
                  />
                  {!isDiscovered && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center text-white px-4">
                        <MapPin className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm font-medium">Get closer to unlock</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedNode.historicalPeriod}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{selectedNode.category}</span>
                </div>
              </div>

              {isDiscovered && selectedNode.audioUrl && (
                <button
                  onClick={handleAudioToggle}
                  className="w-full mb-6 bg-heritage-700 hover:bg-heritage-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
                >
                  {isCurrentlyPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span className="font-semibold">Pause Story</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span className="font-semibold">
                        Listen to Story ({Math.floor(selectedNode.audioDuration / 60)}:
                        {(selectedNode.audioDuration % 60).toString().padStart(2, '0')})
                      </span>
                    </>
                  )}
                </button>
              )}

              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  {isDiscovered
                    ? selectedNode.description
                    : "Walk within 100 meters of this location to unlock the full story and historic images."}
                </p>
              </div>

              {isDiscovered && selectedNode.images && selectedNode.images.length > 0 && (
                <div className="mt-6 space-y-4">
                  {selectedNode.images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={image.url}
                        alt={image.caption}
                        className="w-full rounded-lg"
                      />
                      <p className="text-sm text-neutral-600 italic">
                        {image.caption}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NodeModal;