import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, Sprout, Loader2, Play, Trash2, HelpCircle } from 'lucide-react';

interface ChatBotProps {
  token: string;
  initialHistory: ChatMessage[];
}

const SUGGESTED_QUESTIONS = [
  "What's the best time to plant tomatoes?",
  "How to control aphids organically?",
  "What crops grow well in sandy soil?",
  "How often should I water my crops?"
];

export default function ChatBot({ token, initialHistory }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we have initial history, seed it. Otherwise, add a default welcoming message.
    if (initialHistory && initialHistory.length > 0) {
      setMessages(initialHistory);
    } else {
      setMessages([
        {
          id: 'welcome',
          userId: 'system',
          role: 'model',
          message: "Hello! I am AGRIBOT, your personal AI-powered agricultural advisor. Ask me anything about crop cultivation, pest control, organic treatments, soil fertilization, or harvesting methods!",
          language: 'English',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [initialHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        userId: 'system',
        role: 'model',
        message: "Chat history cleared. How can I help you today with your farming questions?",
        language: 'English',
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    setLoading(true);
    const userText = queryText;
    
    const tempUserMsg: ChatMessage = {
      id: 'local-user-' + Date.now(),
      userId: 'current',
      role: 'user',
      message: userText,
      language: 'English',
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userText,
          language: 'English'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Chat Advisor response error');
      }

      if (data.modelMessage) {
        setMessages(prev => [...prev, data.modelMessage]);
      } else if (data.reply) {
        const fallbackReply: ChatMessage = {
          id: 'local-reply-' + Date.now(),
          userId: 'system',
          role: 'model',
          message: data.reply,
          language: 'English',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackReply]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        userId: 'system',
        role: 'model',
        message: "I am having trouble connecting to my agronomist neural base. Please make sure you have internet access and that the server is running correctly.",
        language: 'English',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const textToSend = input;
    setInput('');
    handleSendQuery(textToSend);
  };

  // Helper to format timestamp to human-friendly local time
  const formatTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just Now';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Centered Heading */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
          AGRIBOT AI Chatbot
        </h2>
        <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-lg mx-auto">
          Ask me anything about farming, crops, or agricultural practices
        </p>
      </div>

      {/* Main Chat Interface */}
      <div id="chatbot-interface-card" className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[580px]">
        
        {/* Solid Green Header matching screenshots */}
        <div className="bg-[#0a0a0a] text-white py-4 px-6 flex justify-between items-center select-none shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <Sprout className="w-5.5 h-5.5 text-[#cbffc2]" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide">AGRIBOT</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wider">Always online</span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer select-none"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-200" />
            <span>Clear</span>
          </button>
        </div>

        {/* Messages Space with light green tint background */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f0f9f4]/45">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar on the left */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0 border border-emerald-700/10 shadow-xs">
                    <Sprout className="w-4 h-4 text-[#cbffc2]" />
                  </div>
                )}

                <div className={`space-y-1 max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble Container */}
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#16a34a] text-white rounded-br-none'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-line font-medium leading-relaxed">{m.message}</p>
                  </div>
                  
                  {/* Timestamp label underneath */}
                  <span className="text-[9.5px] font-semibold text-slate-400/90 px-1 font-sans">
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start gap-3 items-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-[#cbffc2] animate-spin" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm text-xs text-slate-500 font-semibold">
                AGRIBOT is thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions Segment above the input box */}
        <div className="bg-white border-t border-slate-100 px-6 py-3.5 space-y-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400/90 uppercase block font-sans tracking-wider">Suggested questions:</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuery(q)}
                className="px-3.5 py-2 bg-[#f0f9f4] hover:bg-[#e1f5e8] border border-emerald-100 rounded-full text-xs font-semibold text-[#16a34a] transition duration-150 cursor-pointer text-left shadow-2xs hover:shadow-1xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Bottom Form Input with green send icon */}
        <form onSubmit={handleFormSubmit} className="bg-white border-t border-slate-100 p-4 shrink-0 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your farming question..."
            disabled={loading}
            className="flex-1 font-medium bg-[#f0f9f4]/45 text-xs p-3.5 rounded-2xl border border-slate-200/70 text-slate-800 placeholder-slate-400 focus:border-[#16a34a] focus:bg-white focus:outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-black hover:bg-[#111827] disabled:bg-slate-100 text-white disabled:text-slate-350 rounded-[6px] flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Small Footnote disclaimer line below input */}
        <div className="bg-slate-50 border-t border-slate-100 py-2.5 px-6 text-center select-none shrink-0">
          <p className="text-[10px] font-medium text-slate-500/95 leading-relaxed font-sans">
            AGRIBOT uses advanced NLP to understand your farming questions. For best results, be specific about your crops, region, and concerns.
          </p>
        </div>

      </div>

    </div>
  );
}
