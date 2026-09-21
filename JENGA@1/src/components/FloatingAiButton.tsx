import React, { useState } from 'react';
import { AiAssistantModal } from './ai/AiAssistantModal';

export const FloatingAiButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        aria-label="Open AI Hardware Assistant"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span className="text-xs font-bold tracking-wide">Ask Hardware AI</span>
      </button>

      <AiAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};