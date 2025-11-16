import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import useMapStore from '../../stores/mapStore';
import { t } from '../../utils/uiTranslations';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function ChatbotModal({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const currentLanguage = useMapStore((state) => state.currentLanguage);
  const culturalNodes = useMapStore((state) => state.culturalNodes);
  const discoveredNodes = useMapStore((state) => state.discoveredNodes);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Add or update welcome message when modal opens or language changes
      const locationsList = culturalNodes.map(node => node.title).join(', ');
      
      const welcomeTemplate = t('chatbot.welcomeMessage', currentLanguage);
      const welcomeMessage = welcomeTemplate
        .replace('{count}', culturalNodes.length)
        .replace('{locations}', locationsList);
      
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage
        }
      ]);
    }
  }, [isOpen, currentLanguage, culturalNodes]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Prepare cultural nodes data for context
      const locationsData = culturalNodes.map(node => ({
        title: node.title,
        description: node.description,
        category: node.category,
        historicalPeriod: node.historicalPeriod,
        coordinates: `${node.latitude}, ${node.longitude}`,
        discovered: discoveredNodes.has(node.id)
      }));

      const locationsContext = JSON.stringify(locationsData, null, 2);
      
      const prompt = `You are a knowledgeable and friendly tour guide assistant for Timișoara, Romania.
You have access to the following cultural heritage locations in our database:

${locationsContext}

Your role:
1. Help users learn about these specific locations in detail
2. Provide historical context and interesting facts about the monuments
3. Recommend nearby restaurants, cafes, and attractions around these locations
4. Suggest visiting routes and best times to visit
5. Answer questions about the architecture, history, and cultural significance
6. Provide practical information like opening hours, accessibility, etc.

When users ask about a specific location from the list, provide detailed information.
If they ask for recommendations near a location, suggest real places (restaurants, cafes, shops) in that area of Timișoara.
Be conversational, informative, and enthusiastic about Timișoara's rich history.
Keep responses concise but informative (2-4 paragraphs max).
Respond in ${currentLanguage === 'ro' ? 'Romanian' : currentLanguage === 'hu' ? 'Hungarian' : currentLanguage === 'de' ? 'German' : currentLanguage === 'fr' ? 'French' : currentLanguage === 'es' ? 'Spanish' : 'English'}.

User question: ${userMessage}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('chatbot.errorMessage', currentLanguage)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`${
            isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'
          } rounded-xl shadow-2xl max-w-2xl w-full h-[600px] overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <div className="bg-heritage-700 text-white p-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bot className="w-6 h-6" />
              {t('chatbot.modalTitle', currentLanguage)}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-heritage-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-heritage-800' : 'bg-heritage-200'
                  }`}>
                    <Bot className={`w-5 h-5 ${
                      isDark ? 'text-heritage-200' : 'text-heritage-800'
                    }`} />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-heritage-700 text-white'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-heritage-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-heritage-800' : 'bg-heritage-200'
                }`}>
                  <Bot className={`w-5 h-5 ${
                    isDark ? 'text-heritage-200' : 'text-heritage-800'
                  }`} />
                </div>
                <div className={`rounded-lg p-3 ${
                  isDark ? 'bg-neutral-800' : 'bg-neutral-100'
                }`}>
                  <Loader className="w-5 h-5 animate-spin text-heritage-700" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t flex gap-2 flex-shrink-0 ${
            isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-200 bg-white'
          }`}>
            <input
              key={currentLanguage}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.inputPlaceholder', currentLanguage)}
              className={`flex-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:outline-none ${
                isDark
                  ? 'bg-neutral-800 border border-neutral-700 text-white'
                  : 'bg-neutral-50 border border-neutral-300 text-neutral-900'
              }`}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-heritage-700 hover:bg-heritage-800 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ChatbotModal;
