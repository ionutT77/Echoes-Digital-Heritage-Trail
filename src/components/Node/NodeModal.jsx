import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Tag, Play, Pause, Navigation, Loader } from 'lucide-react';
import useMapStore from '../../stores/mapStore';
import useAudioStore from '../../stores/audioStore';
import { translateLocationContent, getLanguageName } from '../../services/geminiService';
import { t } from '../../utils/uiTranslations';
import Swal from 'sweetalert2';

function NodeModal() {
  const selectedNode = useMapStore((state) => state.selectedNode);
  const clearSelectedNode = useMapStore((state) => state.clearSelectedNode);
  const discoveredNodes = useMapStore((state) => state.discoveredNodes);
  const userLocation = useMapStore((state) => state.userLocation);
  const map = useMapStore((state) => state.map);
  const clearRouteFunction = useMapStore((state) => state.clearRouteFunction);
  const createRouteFunction = useMapStore((state) => state.createRouteFunction);
  const currentLanguage = useMapStore((state) => state.currentLanguage);
  const translatedNodes = useMapStore((state) => state.translatedNodes);
  const setTranslatedNode = useMapStore((state) => state.setTranslatedNode);
  const currentNode = useAudioStore((state) => state.currentNode);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const playAudio = useAudioStore((state) => state.playAudio);
  const pauseAudio = useAudioStore((state) => state.pauseAudio);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [displayNode, setDisplayNode] = useState(null);

  useEffect(() => {
    if (!selectedNode) {
      setDisplayNode(null);
      document.body.style.overflow = 'unset';
      return;
    }

    document.body.style.overflow = 'hidden';
    setCurrentVideoIndex(0);

    // If English or translation already exists, use it
    if (currentLanguage === 'en') {
      setDisplayNode(selectedNode);
    } else if (translatedNodes[selectedNode.id]?.[currentLanguage]) {
      setDisplayNode({
        ...selectedNode,
        ...translatedNodes[selectedNode.id][currentLanguage]
      });
    } else {
      // Translate on-demand
      translateNode();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedNode, currentLanguage, translatedNodes]);

  const translateNode = async () => {
    if (!selectedNode) return;
    
    setTranslating(true);
    try {
      const translated = await translateLocationContent(selectedNode, getLanguageName(currentLanguage));
      setTranslatedNode(selectedNode.id, currentLanguage, translated);
      setDisplayNode({
        ...selectedNode,
        ...translated
      });
    } catch (error) {
      console.error('Translation failed:', error);
      await Swal.fire({
        title: 'Translation Failed',
        text: 'Unable to translate content. Showing original.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35',
        timer: 2000
      });
      setDisplayNode(selectedNode);
    } finally {
      setTranslating(false);
    }
  };

  if (!selectedNode) return null;

  const isDiscovered = discoveredNodes.has(selectedNode.id);
  const isCurrentlyPlaying = currentNode?.id === selectedNode.id && isPlaying;
  const hasVideos = selectedNode.videos && selectedNode.videos.length > 0;

  const handleAudioToggle = () => {
    if (isCurrentlyPlaying) {
      pauseAudio();
    } else {
      playAudio(selectedNode);
    }
  };

  const handleGetDirections = () => {
    if (!userLocation || !selectedNode || !map) return;
    if (!createRouteFunction) {
      console.error('Create route function not available');
      return;
    }
    createRouteFunction(userLocation, [selectedNode]);
    clearSelectedNode();
  };

  const handleNextVideo = () => {
    if (hasVideos) {
      setCurrentVideoIndex((prev) => (prev + 1) % selectedNode.videos.length);
    }
  };

  const handlePrevVideo = () => {
    if (hasVideos) {
      setCurrentVideoIndex((prev) => 
        prev === 0 ? selectedNode.videos.length - 1 : prev - 1
      );
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
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-3xl shadow-2xl z-[2001] max-h-[85vh] overflow-y-auto"
          >
            {translating ? (
              <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Loader className="w-12 h-12 text-heritage-700 dark:text-heritage-400 animate-spin mb-4" />
                <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {t('loading', currentLanguage)} {getLanguageName(currentLanguage)}...
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  {t('translatedTo', currentLanguage)} {getLanguageName(currentLanguage)}
                </p>
              </div>
            ) : displayNode ? (
              <>
                <div className="sticky top-0 bg-white dark:bg-neutral-800 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between rounded-t-3xl z-10">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {displayNode?.title || selectedNode.title}
                    </h3>
                    {currentLanguage !== 'en' && (
                      <p className="text-xs text-heritage-600 dark:text-heritage-400 mt-1">
                        🌐 {t('node.translatedTo', currentLanguage)} {getLanguageName(currentLanguage)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={clearSelectedNode}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                  </button>
                </div>

            <div className="p-6">
              {hasVideos && (
                <div className="relative w-full mb-6 rounded-xl overflow-hidden bg-black">
                  <video
                    key={currentVideoIndex}
                    className="w-full h-64 object-cover"
                    controls
                    autoPlay
                    playsInline
                  >
                    <source src={selectedNode.videos[currentVideoIndex].url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {selectedNode.videos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevVideo}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Previous video"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextVideo}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Next video"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedNode.videos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentVideoIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentVideoIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            aria-label={`Video ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {selectedNode.videos[currentVideoIndex].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-sm text-white">
                        {displayNode?.videos?.[currentVideoIndex]?.caption || selectedNode.videos[currentVideoIndex].caption}
                      </p>
                    </div>
                  )}
                </div>
              )}

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

              <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{displayNode.historicalPeriod || selectedNode.historicalPeriod}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{displayNode.category || selectedNode.category}</span>
                </div>
              </div>

              {userLocation && (
                <button
                  onClick={handleGetDirections}
                  className="w-full mb-6 bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-semibold"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{t('node.getDirections', currentLanguage)}</span>
                </button>
              )}

              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                {isDiscovered
                  ? (displayNode.description || selectedNode.description)
                  : t('node.unlockLocation', currentLanguage)}
              </p>

              {isDiscovered && selectedNode.audioUrl && (
                <button
                  onClick={handleAudioToggle}
                  className="w-full mb-6 bg-heritage-700 hover:bg-heritage-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
                >
                  {isCurrentlyPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span className="font-semibold">{t('node.pauseStory', currentLanguage)}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span className="font-semibold">
                        {t('node.listenToStory', currentLanguage)} ({Math.floor(selectedNode.audioDuration / 60)}:
                        {(selectedNode.audioDuration % 60).toString().padStart(2, '0')})
                      </span>
                    </>
                  )}
                </button>
              )}

              {isDiscovered && selectedNode.images && selectedNode.images.length > 0 && (
                <div className="mt-6 space-y-4">
                  {selectedNode.images.map((image, index) => {
                    const translatedCaption = displayNode?.images?.[index]?.caption || image.caption;
                    return (
                      <div key={index} className="space-y-2">
                        <img
                          src={image.url}
                          alt={translatedCaption}
                          className="w-full rounded-lg"
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                          {translatedCaption}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-neutral-600 dark:text-neutral-300">Loading...</p>
            </div>
          )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NodeModal;
