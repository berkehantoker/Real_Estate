"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getChatMessagesAPI, sendChatMessageAPI, deleteChatMessageAPI, markChatAsReadAPI } from '@/services/chatService';
import { FiSend, FiMessageSquare, FiX, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import * as signalR from '@microsoft/signalr';
import Cookies from 'js-cookie';

interface ChatWidgetProps {
  productId: number;
  receiverId: number;
  receiverName: string;
}

interface ApiMessage {
  chatMessageId: number;
  senderId: number;
  message: string;
  sentAt: string;
  senderName: string;
  isDeletedForAll?: boolean;
}

export default function ChatWidget({ productId, receiverId, receiverName }: ChatWidgetProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => {
    if (!isOpen || !user) return;
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7252/signalrhub', {
        accessTokenFactory: () => Cookies.get('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveChatMessage', (msg: any) => {
      if (msg.ProductId === productId) {
        if (msg.SenderId === Number(useAuthStore.getState().user?.id)) return;
        setMessages(prev => [...prev, {
          chatMessageId: Date.now(),
          senderId: msg.SenderId,
          message: msg.Message,
          sentAt: msg.SentAt,
          senderName: msg.SenderName,
        }]);
        scrollToBottom();
      }
    });

    connection.on('MessageDeleted', (data: { chatMessageId: number }) => {
      setMessages(prev => prev.map(m => 
        m.chatMessageId === data.chatMessageId 
          ? { ...m, message: "🚫 Bu mesaj silindi.", isDeletedForAll: true } 
          : m
      ));
    });

    const startSignalR = async () => {
      try {
        await connection.start();
        if (!isMounted) {
          await connection.stop();
        } else {
          connectionRef.current = connection;
          await connection.invoke('JoinProductChat', productId, receiverId);
        }
      } catch (error) {
        console.error('Chat SignalR bağlantı hatası:', error);
      }
    };

    startSignalR();
    loadMessages();
    markChatAsReadAPI(productId, receiverId);

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('LeaveProductChat', productId, receiverId).catch(() => {});
        connection.stop();
      }
      connectionRef.current = null;
    };
  }, [isOpen, user?.id, productId]);

  const loadMessages = async () => {
    try {
      const data = await getChatMessagesAPI(productId, receiverId);
      const mappedData = data.map((m: any) => ({
        chatMessageId: m.ChatMessageId || m.chatMessageId,
        senderId: m.SenderId || m.senderId,
        message: (m.IsDeletedForAll || m.isDeletedForAll) ? "🚫 Bu mesaj silindi." : (m.Message || m.message),
        sentAt: m.SentAt || m.sentAt,
        senderName: m.SenderName || m.senderName,
        isDeletedForAll: m.IsDeletedForAll || m.isDeletedForAll || false
      }));
      setMessages(mappedData);
      scrollToBottom();
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    const tempMessage = newMessage.trim();

    const optimisticMsg: ApiMessage = {
      chatMessageId: Date.now(),
      senderId: Number(user.id),
      message: tempMessage,
      sentAt: new Date().toISOString(),
      senderName: user.name,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    setIsSending(true);
    scrollToBottom();

    try {
      const realMsg = await sendChatMessageAPI({
        senderId: Number(user.id),
        receiverId,
        productId,
        message: tempMessage,
      });

      const realSQLId = realMsg.chatMessageId || realMsg.ChatMessageId;
      if (realSQLId) {
        setMessages(prev => prev.map(m => 
          m.chatMessageId === optimisticMsg.chatMessageId 
            ? { ...m, chatMessageId: realSQLId } 
            : m
        ));
      }

      await loadMessages();
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (chatMessageId: number) => {
    if (!window.confirm('Mesajı herkes için silmek istiyor musunuz?')) return;
    try {
      await deleteChatMessageAPI(chatMessageId);
      setMessages(prev => prev.map(m => 
        m.chatMessageId === chatMessageId 
          ? { ...m, message: "🚫 Bu mesaj silindi.", isDeletedForAll: true } 
          : m
      ));
    } catch (error) {
      console.error('Mesaj silinemedi:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMyOwnListing = user && Number(user.id) === Number(receiverId);

  return (
    <>
      {isMyOwnListing ? (
        <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl border border-gray-200 cursor-not-allowed select-none shadow-sm">
          <span>🏡 Bu Sizin İlanınız</span>
        </div>
      ) : user ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md transition-all active:scale-95"
        >
          <FiMessageSquare /> Emlakçıya Mesaj Yaz
        </button>
      ) : (
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md transition-all active:scale-95"
        >
          <FiMessageSquare /> Mesaj Yazmak İçin Giriş Yap
        </Link>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMessageSquare className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold">{receiverName}</h3>
                  <p className="text-xs text-blue-100">Emlak Danışmanı</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                  <FiMessageSquare className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Henüz mesaj yok.</p>
                  <p className="text-xs mt-1">Sorunuzu iletin, en kısa sürede dönüş yapalım.</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMine = msg.senderId === Number(user?.id);
                return (
                  <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[80%] p-3 rounded-xl text-sm ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200 shadow-sm'
                    }`}>
                      {!isMine && <p className="text-xs font-bold text-blue-600 mb-1">{msg.senderName}</p>}
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1.5 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {isMine && !msg.isDeletedForAll && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.chatMessageId); }}
                          className="absolute -top-1 -right-1 p-1 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                          title="Mesajı sil"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesajınızı yazın... (Enter ile gönder)"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm"
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0">
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}} />
    </>
  );
}