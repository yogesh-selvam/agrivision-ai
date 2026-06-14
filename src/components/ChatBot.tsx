import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, Sprout, Loader2, Sparkles, Languages, Globe } from 'lucide-react';

interface ChatBotProps {
  token: string;
  initialHistory: ChatMessage[];
}

type LanguageCode = 'English' | 'Tamil' | 'Hindi' | 'Kannada';

const LANGUAGES: { code: LanguageCode; label: string; placeholder: string }[] = [
  { code: 'English', label: 'English', placeholder: 'Ask about crop care, pest treatment...' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)', placeholder: 'பயிர் பராமரிப்பு மற்றும் பூச்சி மேಲಾண்மை பற்றி கேளுங்கள்...' },
  { code: 'Hindi', label: 'हिन्दी (Hindi)', placeholder: 'फसल की देखभाल या कवक नियंत्रण के बारे में पूछें...' },
  { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)', placeholder: 'ಬೆಳೆ ರಕ್ಷಣೆ ಹಾಗು ಕೀಟಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ...' }
];

export default function ChatBot({ token, initialHistory }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('English');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialHistory || []);
  }, [initialHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const activeLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: 'local-' + Date.now(),
      userId: 'current',
      role: 'user',
      message: userText,
      language: language,
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
          language: language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Chat server response error');
      }

      if (data.modelMessage) {
        setMessages(prev => [...prev, data.modelMessage]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        userId: 'system',
        role: 'model',
        message: 'Could not connect to the Agronomist brain server. Please verify your internet connection or credentials in Secrets.',
        language: language,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="chatbot-container" className="bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col h-[520px] max-w-4xl mx-auto overflow-hidden">
      
      {/* Upper header */}
      <div className="bg-slate-50/50 border-b border-slate-100 p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold font-display text-[14px] text-slate-800 flex items-center gap-1.5 leading-none">
              Agribot AI Advisor
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </h4>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mt-1">Multilingual Agronomist Engine</span>
          </div>
        </div>

        {/* Language pickers */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200/60">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
          <div id="language-toggles" className="flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 text-[11px] rounded-lg font-bold transition cursor-pointer ${
                  language === lang.code
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {lang.label.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Globe className="w-10 h-10 text-slate-200 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 font-display">Start a chat in your preferred language</span>
            <p className="text-[10px] text-slate-400 font-medium max-w-xs leading-relaxed">
              Agribot answers queries about crop diseases, pest remedies, nutrient balancing and sowing dynamics immediately.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-3.5 rounded-2xl text-[11px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-700 text-white rounded-br-none font-sans'
                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-xs font-sans'
                }`}
              >
                {m.role === 'model' && (
                  <span className="text-[8px] font-mono font-bold tracking-widest text-brand-650 block uppercase mb-1">AGRIBOT Advisor</span>
                )}
                <div className="whitespace-pre-line prose prose-slate max-w-none">
                  {m.message}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3.5 rounded-2xl rounded-bl-none border border-slate-100 shadow-xs flex items-center gap-2 text-[11px] text-slate-400 font-semibold font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              Agribot is formulating advice...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeLanguage.placeholder}
          disabled={loading}
          className="flex-1 bg-slate-50/50 text-[11.5px] p-3 rounded-xl border border-slate-100 text-slate-800 placeholder-slate-400 focus:border-brand-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 text-white disabled:text-slate-300 px-4 py-3 rounded-xl flex items-center justify-center transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
