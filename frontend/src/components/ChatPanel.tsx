import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { score: number; source: string; page: number }[];
}

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.askQuestion(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[600px]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <Bot className="text-primary-400" />
        <div>
          <h2 className="font-semibold">Document Assistant</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400">Ready to chat</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-6 mb-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
            <Bot size={48} className="mb-4" />
            <p>Upload a document to start asking questions</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>

              <div className="flex flex-col max-w-[80%]">
                <div
                  className={`p-4 rounded-2xl ${
                    msg.role === 'assistant'
                      ? 'bg-white/5 border border-white/10 rounded-tl-none'
                      : 'bg-primary-600 rounded-tr-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 w-full">
                      <Info size={10} /> Sources
                    </div>
                    {msg.sources.map((src, sidx) => (
                      <div
                        key={sidx}
                        className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-400"
                        title={`Score: ${src.score.toFixed(4)}`}
                      >
                        {src.source} {src.page > 0 && `(p. ${src.page})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin text-primary-400" size={18} />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-primary-500/50 transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1.5 p-2 text-primary-400 hover:text-primary-300 disabled:opacity-30 disabled:text-slate-500 transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
