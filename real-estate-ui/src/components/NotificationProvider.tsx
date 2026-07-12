"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import * as signalR from '@microsoft/signalr';
import Cookies from 'js-cookie';

// Module-level deduplication: Strict Mode'un çift instance (kopya) sorununu çözer
let lastProcessedMessageKey = "";

export default function NotificationProvider() {
  const { user, incrementUnread } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7252/signalrhub', {
        accessTokenFactory: () => Cookies.get('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on('NewMessageNotification', (msg) => {
      const receiverId = msg.ReceiverId || msg.receiverId;
      const sentAt = msg.SentAt || msg.sentAt;
      const msgKey = `${receiverId}-${sentAt}`;

      if (receiverId == user.id && lastProcessedMessageKey !== msgKey) {
        lastProcessedMessageKey = msgKey;
        incrementUnread();
      }
    });

    const startSignalR = async () => {
      try {
        await connection.start();
        if (!isMounted) {
          await connection.stop();
        }
      } catch (error) {
        console.error('SignalR bildirim bağlantı hatası:', error);
      }
    };

    startSignalR();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [user?.id]);

  return null;
}