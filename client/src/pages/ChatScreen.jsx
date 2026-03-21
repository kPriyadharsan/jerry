import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Command } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const { messages, isTyping, sendChatMessage } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full relative z-0">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-core/10 rounded-[60%_40%_55%_45%/45%_55%_40%_60%] blur-[80px] animate-blob pointer-events-none -z-10" />
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-green-core shadow-glow' : 'bg-green-deep'}`}>
              {msg.role === 'user' ? <User size={18} className="text-black-spore" /> : <Bot size={18} className="text-white" />}
            </div>
            <div className={`max-w-xl p-4 shadow-md ${msg.role === 'user' ? 'bg-green-core/10 border border-green-core/20 text-text-primary rounded-lg rounded-tr-none' : 'bg-bg-glass backdrop-blur-md border border-green-core/20 shadow-card text-text-primary rounded-lg rounded-tl-none'}`}>
              <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4 max-w-4xl mx-auto flex-row">
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-deep flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="p-4 bg-bg-glass backdrop-blur-md shadow-card border border-green-core/20 rounded-lg rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-core animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-green-core animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-green-core animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-bg-primary/85 backdrop-blur-lg border-t border-green-core/10 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <Command className="absolute left-4 text-text-muted" size={20} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Jerry... (try /chat or /chat/me)"
            className="w-full bg-bg-secondary rounded-md py-4 pl-12 pr-20 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-green-core text-black-spore font-semibold rounded-pill shadow-glow hover:bg-green-deep hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-xs text-text-muted mt-2">Jerry is an AI brain synced with your task data.</p>
      </div>
    </div>
  );
}
