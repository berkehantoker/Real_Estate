"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { getChatMessagesAPI, sendChatMessageAPI, deleteChatMessageAPI, deleteConversationAPI, markChatAsReadAPI } from '../../../services/chatService';
import { FiMessageSquare, FiSend, FiArrowLeft, FiTrash2, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';
import * as signalR from '@microsoft/signalr';
import Cookies from 'js-cookie';

interface Contact {
  productId: number;
  productTitle: string;
  contactUserId: number;
  contactName: string;
  lastMessage: string;
  sentAt: string;
  isRead: boolean;
  lastMessageSenderId: number;
}

interface ChatMessage {
  chatMessageId: number;
  senderId: number;
  message: string;
  sentAt: string;
  senderName: string;
  isDeletedForAll?: boolean;
}

export default function UserMessagesPage() {
  const { user, setUnreadMessageCount } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);
  const selectedChatRef = useRef<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const scrollChatToBottom = () => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7252/signalrhub', {
        accessTokenFactory: () => Cookies.get('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveChatMessage', (msg: any) => {
      fetchContacts();
      const currentSelectedChat = selectedChatRef.current;
      if (currentSelectedChat && msg.ProductId === currentSelectedChat.productId) {
        if (msg.SenderId === Number(useAuthStore.getState().user?.id)) return;
        setMessages(prev => [...prev, {
          chatMessageId: msg.ChatMessageId || msg.chatMessageId || Date.now(),
          senderId: msg.SenderId || msg.senderId,
          message: msg.Message || msg.message,
          sentAt: msg.SentAt || msg.sentAt,
          senderName: msg.SenderName || msg.senderName,
          isDeletedForAll: msg.IsDeletedForAll || msg.isDeletedForAll || false
        }]);
        scrollChatToBottom();
      }
    });

    connection.on('MessageDeleted', (data: any) => {
      const targetId = data.ChatMessageId || data.chatMessageId;
      setMessages(prev => prev.map(m => 
        m.chatMessageId === targetId 
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
        }
      } catch (error) {
        console.error('SignalR bağlantı hatası:', error);
      }
    };

    startSignalR();
    fetchContacts();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
      }
      connectionRef.current = null;
    };
  }, [user?.id]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const axiosInstance = (await import('../../../utils/axiosInstance')).default;
      const response = await axiosInstance.get('/Chat/my-contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Kontaklar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = async (contact: Contact) => {
    if (selectedChatRef.current && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('LeaveProductChat', selectedChatRef.current.productId, selectedChatRef.current.contactUserId).catch(() => {});
    }

    setSelectedChat(contact);
    selectedChatRef.current = contact;
    setUnreadMessageCount(0);
    try {
      await markChatAsReadAPI(contact.productId, contact.contactUserId);
      const data = await getChatMessagesAPI(contact.productId, contact.contactUserId);
      const mappedData = data.map((m: any) => ({
        chatMessageId: m.ChatMessageId || m.chatMessageId,
        senderId: m.SenderId || m.senderId,
        message: (m.IsDeletedForAll || m.isDeletedForAll) ? "🚫 Bu mesaj silindi." : (m.Message || m.message),
        sentAt: m.SentAt || m.sentAt,
        senderName: m.SenderName || m.senderName,
        isDeletedForAll: m.IsDeletedForAll || m.isDeletedForAll || false
      }));
      setMessages(mappedData);
      await connectionRef.current?.invoke('JoinProductChat', contact.productId, contact.contactUserId);
      scrollChatToBottom();
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedChat) return;
    const tempMessage = newMessage.trim();
    const optimisticMsg = {
      chatMessageId: Date.now(), senderId: Number(user.id),
      message: tempMessage, sentAt: new Date().toISOString(), senderName: user.name,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    setIsSending(true);
    scrollChatToBottom();

    try {
      const realMsg = await sendChatMessageAPI({
        senderId: Number(user.id),
        receiverId: selectedChat.contactUserId,
        productId: selectedChat.productId,
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

      fetchContacts();
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      setMessages(prev => prev.filter(m => m.chatMessageId !== optimisticMsg.chatMessageId));
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

  const handleDeleteConversation = async () => {
    if (!selectedChat) return;
    if (!window.confirm('Bu sohbet geçmişi sadece sizin ekranınızdan silinecektir. Emin misiniz?')) return;
    try {
      await deleteConversationAPI(selectedChat.productId, selectedChat.contactUserId);
      setSelectedChat(null);
      fetchContacts();
    } catch (error) {
      console.error('Sohbet temizlenemedi:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiMessageSquare className="text-5xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Mesajlarınızı görüntülemek için giriş yapmalısınız.</p>
          <Link href="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FiMessageSquare className="text-blue-600" /> Mesajlarım
          </h1>
          <p className="text-gray-500 mt-1">Emlak danışmanlarıyla yaptığınız tüm görüşmeler.</p>
        </div>
      </div>

      <div className="flex gap-6" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Görüşmeler</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 animate-pulse">Yükleniyor...</div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FiMessageSquare className="text-3xl mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Henüz hiç mesajlaşma yok.</p>
                <Link href="/ilanlar" className="text-blue-600 text-sm font-semibold hover:underline mt-2 inline-block">
                  İlanları İncele
                </Link>
              </div>
            ) : (
              contacts.map((contact) => {
                const isUnreadForMe = !contact.isRead && contact.lastMessageSenderId !== Number(user?.id);

                return (
                <div
                  key={`${contact.productId}-${contact.contactUserId}`}
                  onClick={() => {
                    setContacts(prev => prev.map(c => 
                      c.productId === contact.productId && c.contactUserId === contact.contactUserId 
                        ? { ...c, isRead: true } 
                        : c
                    ));
                    openChat(contact);
                  }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedChat?.productId === contact.productId ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                  } ${isUnreadForMe ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate transition-all ${isUnreadForMe ? 'font-extrabold text-gray-900' : 'font-bold text-gray-700'}`}>
                        {contact.contactName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{contact.productTitle}</p>
                      <p className={`text-xs truncate mt-1 transition-all ${isUnreadForMe ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                        {contact.lastMessage}
                      </p>
                    </div>
                    {isUnreadForMe && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0 shadow-sm animate-pulse"></div>
                    )}
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                  {selectedChat.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{selectedChat.contactName}</p>
                  <p className="text-xs text-blue-100">{selectedChat.productTitle}</p>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  title="Sohbeti Temizle"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiXCircle className="text-lg" />
                </button>
              </div>
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === Number(user?.id);
                  return (
                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative max-w-[75%] p-3 rounded-xl text-sm ${
                        isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200 shadow-sm'
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
              </div>
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Mesajınızı yazın... (Enter ile gönder)"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 text-sm"
                    disabled={isSending}
                  />
                  <button onClick={handleSend} disabled={!newMessage.trim() || isSending}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0">
                    <FiSend />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiMessageSquare className="text-5xl mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Görüşme seçmek için soldaki bir sohbete tıklayın.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}