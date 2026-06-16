import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';

const SUGGESTED = [
  'What products do you have?',
  'Help me find a cozy sweater',
  'What sizes are available?',
  'Do you have gift options?',
];

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-premium-dark/40"
        
        
      />
    ))}
  </div>
);

const OneChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm **OneChat**, your personal shopping assistant at OneBuy. How can I help you find something cozy today? ✨",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMessage(false);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

      const lowerText = userText.toLowerCase();
      let reply = "I'm a simple demo bot right now, but feel free to browse our premium collection!";

      if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) {
        reply = "Hello there! How can I help you style your wardrobe today?";
      } else if (lowerText.includes('shipping') || lowerText.includes('delivery')) {
        reply = "We offer **free shipping** on all orders over $75! Standard delivery usually takes 3-5 business days.";
      } else if (lowerText.includes('return') || lowerText.includes('refund')) {
        reply = "You can return any unworn items within **30 days** of purchase for a full refund.";
      } else if (lowerText.includes('size') || lowerText.includes('fit')) {
        reply = "Our sizes generally run true to fit. You can check the specific size guide on any product page for exact measurements!";
      } else if (lowerText.includes('gift') || lowerText.includes('present')) {
        reply = "We offer beautiful gift wrapping options at checkout for a small additional fee!";
      } else if (lowerText.includes('product') || lowerText.includes('sweater') || lowerText.includes('shirt')) {
        reply = "We have a fantastic collection of premium essentials. Check out our **Collections** page to see what's trending!";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong with my programming!" }]);
    }

    if (!isOpen) setHasNewMessage(true);
    setLoading(false);
  };

  const renderContent = (text) =>
    (text || '')
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part, i) =>
        part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
      );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        
        
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-premium-dark text-white shadow-2xl flex items-center justify-center"
        aria-label="Open chat">
                  {isOpen ? (
            <span key="x">
              <X size={22} />
            </span>
          ) : (
            <span key="chat">
              <MessageCircle size={22} />
            </span>
          )}
                {/* New message badge */}
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-premium-accent border-2 border-white" />
        )}
      </button>

      {/* Chat window */}
              {isOpen && (
          <div
            
            
            
            
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[540px] flex flex-col bg-white rounded-2xl shadow-2xl border border-premium-neutral overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-premium-dark text-white flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-premium-accent flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">OneChat</p>
                <p className="text-xs text-white/60">AI Shopping Assistant</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-white/60">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-premium-light/40">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  
                  
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${msg.role === 'user' ? 'bg-premium-accent' : 'bg-premium-dark'}`}>
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-premium-dark text-white rounded-br-sm'
                      : 'bg-white text-premium-dark border border-premium-neutral rounded-bl-sm shadow-sm'
                  }`}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div   className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-premium-dark flex items-center justify-center text-white flex-shrink-0">
                    <Bot size={12} />
                  </div>
                  <div className="bg-white border border-premium-neutral rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions (only on first message) */}
            {messages.length === 1 && (
              <div className="flex gap-2 px-4 py-2 flex-wrap bg-white border-t border-premium-neutral flex-shrink-0">
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-premium-neutral bg-premium-light hover:bg-premium-neutral text-premium-dark transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-premium-neutral flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything…"
                disabled={loading}
                className="flex-1 bg-premium-light border border-premium-neutral rounded-xl px-4 py-2.5 text-sm text-premium-dark placeholder-premium-dark/40 focus:outline-none focus:border-premium-dark transition-colors disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-premium-dark text-white flex items-center justify-center hover:bg-premium-dark/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        )}
          </>
  );
};

export default OneChat;
