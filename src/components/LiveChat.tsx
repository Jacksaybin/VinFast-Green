/**
 * LiveChat component - Floating chat bubble with chat window
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Phone, Mail, Clock } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  avatar?: string;
}

const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là chuyên viên tư vấn V-GREEN. Tôi có thể giúp gì cho bạn?',
      sender: 'support',
      timestamp: new Date(),
      avatar: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/715121c1-22cf-4eef-bdf1-d798aa8172da.jpg'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setIsTyping(true);
      
      // Simulate support response
      setTimeout(() => {
        setIsTyping(false);
        const supportResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getAutoResponse(inputMessage),
          sender: 'support',
          timestamp: new Date(),
          avatar: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/715121c1-22cf-4eef-bdf1-d798aa8172da.jpg'
        };
        setMessages(prev => [...prev, supportResponse]);
      }, 1500);
    }
  };

  const getAutoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('gói đầu tư') || lowerMessage.includes('đầu tư')) {
      return 'V-GREEN hiện có 8 gói đầu tư với lãi suất từ 15-25%/năm. Bạn muốn tìm hiểu gói nào cụ thể?';
    }
    if (lowerMessage.includes('lãi suất') || lowerMessage.includes('lợi nhuận')) {
      return 'Lãi suất V-GREEN từ 15-25%/năm tùy gói đầu tư. Gói VIP có lãi suất cao nhất 25%/năm với kỳ hạn 24 tháng.';
    }
    if (lowerMessage.includes('an toàn') || lowerMessage.includes('bảo đảm')) {
      return 'V-GREEN được bảo đảm 100% bởi VinGroup - tập đoàn lớn nhất Việt Nam. Tài sản của bạn được bảo vệ tuyệt đối.';
    }
    if (lowerMessage.includes('rút tiền') || lowerMessage.includes('thanh toán')) {
      return 'Bạn có thể rút tiền bất kỳ lúc nào trong giờ hành chính. Thời gian xử lý 1-3 ngày làm việc.';
    }
    if (lowerMessage.includes('đăng ký') || lowerMessage.includes('mở tài khoản')) {
      return 'Để đăng ký V-GREEN, bạn cần CMND/CCCD, tài khoản ngân hàng và số điện thoại. Tôi có thể hỗ trợ bạn đăng ký ngay.';
    }
    
    return 'Cảm ơn bạn đã liên hệ. Tôi sẽ chuyển cho chuyên viên tư vấn để được hỗ trợ tốt nhất. Vui lòng chờ trong giây lát.';
  };

  const quickReplies = [
    'Gói đầu tư nào phù hợp?',
    'Lãi suất như thế nào?',
    'Cách rút tiền ra sao?',
    'Tôi muốn đăng ký'
  ];

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Notification Badge */}
          {!isOpen && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center z-10">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 relative overflow-hidden"
          >
            {/* Pulse animation */}
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            
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
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">V-GREEN Support</h3>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-green-100">
                      {isOnline ? 'Đang trực tuyến' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-200 hover:text-white cursor-pointer" />
                <Mail className="w-4 h-4 text-green-200 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.sender === 'user' 
                      ? 'bg-green-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.sender === 'support' && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 order-1 flex-shrink-0">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="p-3 bg-white border-t">
              <p className="text-xs text-gray-500 mb-2">Câu hỏi thường gặp:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(reply)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;