'use client';

import { X, Bot, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = '';
      const inputLower = input.toLowerCase();

      if (inputLower.includes('grønn') && inputLower.includes('brød')) {
        response = 'For grønnere brødvalg, se etter økologiske alternativer fra lokale bakerier. Produkter med kort ingrediensliste og norsk korn scorer ofte høyt. Prøv å skanne "Økologisk grovbrød" fra Bakehuset!';
      } else if (inputLower.includes('norsk') || inputLower.includes('lokal')) {
        response = 'Norske produkter har ofte lavere klimaavtrykk pga. kortere transport. Se etter "Nyt Norge"-merket eller sjekk produktets opprinnelsesland i appen.';
      } else if (inputLower.includes('økologisk') || inputLower.includes('organic')) {
        response = 'Økologiske produkter dyrkes uten syntetiske sprøytemidler. Bruk filteret "Kun økologisk" for å finne sertifiserte alternativer!';
      } else if (inputLower.includes('score') || inputLower.includes('poeng')) {
        response = 'GrønnScore beregnes basert på: miljøpåvirkning, næringsinnhold, opprinnelse og emballasje. A er best (80-100), E er dårligst (0-40).';
      } else {
        response = 'Jeg kan hjelpe deg med å finne grønnere produktvalg! Spør meg om bærekraftige alternativer, hva GrønnScore betyr, eller tips for miljøvennlig handling.';
      }

      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">GrønnHjelper</h2>
              <p className="text-xs text-gray-500">AI-assistent for grønnere valg</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Hei! Jeg kan hjelpe deg med å finne grønnere produkter. Prøv å spørre:
              </p>
              <div className="space-y-2">
                {[
                  'Hva er det grønneste brødet?',
                  'Hvordan fungerer GrønnScore?',
                  'Tips for norske produkter'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-green-500 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Skriv en melding..."
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
