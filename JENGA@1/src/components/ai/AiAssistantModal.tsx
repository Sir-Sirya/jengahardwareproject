import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/ai';
import { sendAiPrompt } from '../../services/aiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your Jenga Hardware assistant. Describe your project or repair (e.g., "I need to fix a leaking tap" or "Materials for plastering a room") and I will guide you.',
      timestamp: new Date(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAiPrompt(userMsg.text);
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: response.message,
        products: response.recommendedProducts,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an issue retrieving recommendations. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
          <h3 className="font-semibold text-sm">Jenga Project Advisor</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg font-bold px-1"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>

            {/* Render Recommended Product Cards inside Chat */}
            {msg.products && msg.products.length > 0 && (
              <div className="mt-2 w-full space-y-1.5 pl-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Suggested Products:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {msg.products.map((prod) => (
                    <a
                      key={prod.id}
                      href={`/products/${prod.id}`}
                      className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <img
                        src={prod.imageUrl || '/placeholder.png'}
                        alt={prod.title}
                        className="h-9 w-9 object-cover rounded bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-800 truncate">
                          {prod.title}
                        </p>
                        <p className="text-[11px] font-bold text-blue-600">
                          KES {prod.price.toLocaleString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs p-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1">Checking inventory...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a repair or materials..."
          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};