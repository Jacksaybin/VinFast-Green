/**
 * LiveChat component - Floating chat bubble with chat window
 * Connects to real backend (chatApi) with polling. Falls back to local auto-response
 * when the backend is unreachable.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Phone, Mail, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatApi, ApiChatMessage } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const SUPPORT_AVATAR = 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/715121c1-22cf-4eef-bdf1-d798aa8172da.jpg';

function toMessage(row: ApiChatMessage): Message {
  return {
    id: row.id,
    text: row.text,
    sender: row.sender === 'admin' ? 'support' : 'user',
    timestamp: new Date(row.created_at),
  };
}

const LiveChat: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const user = useAuthStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOk, setBackendOk] = useState(true);
  const [hasSent, setHasSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadConversation = async () => {
    try {
      const data = await chatApi.getConversation();
      if (!data) return;
      setIsOnline(true);
      setBackendOk(true);
      setHasSent(data.messages.length > 0);
      setMessages(data.messages.map(toMessage));
    } catch {
      setBackendOk(false);
      setMessages((prev) =>
        prev.length === 0
          ? [
              {
                id: 'welcome',
                text: t('liveChat.welcome'),
                sender: 'support',
                timestamp: new Date(),
              },
            ]
          : prev
      );
    }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!isOpen) return;
      try {
        const data = await chatApi.getConversation();
        if (data) {
          setBackendOk(true);
          setIsOnline(true);
          const next = data.messages.map(toMessage);
          setMessages((prev) => (prev.length !== next.length ? next : prev));
        }
      } catch {
        setIsOnline(false);
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      loadConversation().finally(() => setIsLoading(false));
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getAutoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes(t('liveChat.packageKeyword1')) || lowerMessage.includes(t('liveChat.packageKeyword2'))) {
      return t('liveChat.autoPackage');
    }
    if (lowerMessage.includes(t('liveChat.rateKeyword1')) || lowerMessage.includes(t('liveChat.rateKeyword2'))) {
      return t('liveChat.autoRate');
    }
    if (lowerMessage.includes(t('liveChat.withdrawKeyword1')) || lowerMessage.includes(t('liveChat.withdrawKeyword2'))) {
      return t('liveChat.autoWithdraw');
    }
    if (lowerMessage.includes(t('liveChat.registerKeyword1')) || lowerMessage.includes(t('liveChat.registerKeyword2'))) {
      return t('liveChat.autoRegister');
    }

    return t('liveChat.autoGeneric');
  };

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || isTyping) return;

    const optimistic: Message = {
      id: `local-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputMessage('');
    setHasSent(true);

    if (backendOk) {
      try {
        setIsTyping(true);
        const sent = await chatApi.sendMessage(text);
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? toMessage(sent || optimistic as any) : m)));
      } catch {
        setBackendOk(false);
        setIsOnline(false);
        fallbackResponse(text);
      } finally {
        setIsTyping(false);
      }
    } else {
      fallbackResponse(text);
    }
  };

  const fallbackResponse = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith('local-')),
        {
          id: `auto-${Date.now()}`,
          text: getAutoResponse(text),
          sender: 'support',
          timestamp: new Date(),
        },
      ]);
    }, 1200);
  };

  const quickReplies = [
    t('liveChat.quick1'),
    t('liveChat.quick2'),
    t('liveChat.quick3'),
    t('liveChat.quick4'),
  ];

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Notification Badge */}
          {!isOpen && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-danger rounded-full flex items-center justify-center z-10">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 bg-gradient-to-br from-brand-primary-500 to-brand-primary-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 relative overflow-hidden"
            aria-label={isOpen ? t('liveChat.close') : t('liveChat.open')}
          >
            <div className="absolute inset-0 bg-success/40 rounded-full animate-ping opacity-20"></div>

            {isOpen ? (
              <X className="w-6 h-6 text-white relative z-10" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white relative z-10" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-card rounded-2xl shadow-2xl border border-border z-50 flex flex-col overflow-hidden max-w-[calc(100vw-3rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 p-4 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-card/20 flex items-center justify-center">
                    <img src={SUPPORT_AVATAR} alt="support" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t('liveChat.headerTitle')}</h3>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success/50' : 'bg-muted-foreground/60'}`}></div>
                      <span className="text-xs text-primary-foreground">
                        {isOnline ? t('liveChat.online') : t('liveChat.offline')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-success/80 hover:text-white cursor-pointer" aria-label={t('liveChat.phone')} />
                  <Mail className="w-4 h-4 text-success/80 hover:text-white cursor-pointer" aria-label={t('liveChat.email')} />
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {isLoading && (
              <div className="text-center text-xs text-muted-foreground py-4">{t('liveChat.loading')}</div>
            )}

            {!hasSent && !isLoading && (
              <div className="text-center text-xs text-muted-foreground bg-card rounded-lg p-3 border border-border">
                {user?.fullName
                  ? t('liveChat.greetingNamed', { name: user.fullName })
                  : t('liveChat.greetingGeneric')}
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-card text-foreground rounded-bl-md shadow-sm border border-border'
                  }`}>
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <div className={`text-xs text-muted-foreground mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.sender === 'support' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 order-1 flex-shrink-0">
                    <img src={SUPPORT_AVATAR} alt="support" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {!hasSent && (
            <div className="p-3 bg-card border-t flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-2">{t('liveChat.faqLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(reply)}
                    className="rounded-full bg-success-subtle px-3 py-1 text-xs text-primary transition-colors hover:bg-success/30"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-card border-t flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('liveChat.placeholder')}
                className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-50"
                aria-label={t('liveChat.send')}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-background border-t flex-shrink-0">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{t('liveChat.support247')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;
