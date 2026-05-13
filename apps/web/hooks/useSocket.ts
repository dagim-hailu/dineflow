'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export interface OrderNewEvent {
  orderId: string;
  tableId: string | null;
  restaurantId: string;
  items: Array<{ name: string; quantity: number }>;
  totalAmount: number;
  createdAt: Date;
}

export interface OrderStatusEvent {
  orderId: string;
  status: string;
  restaurantId: string;
}

export interface TableRequestEvent {
  tableId: string;
  requestType: 'bill' | 'water' | 'assistance';
  restaurantId: string;
}

type EventMap = {
  'order:new': (data: OrderNewEvent) => void;
  'order:status': (data: OrderStatusEvent) => void;
  'table:request': (data: TableRequestEvent) => void;
};

let sharedSocket: Socket | null = null;

/** Returns a stable socket.io Socket connected to the /events namespace. */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/events$/, '') || 'http://localhost';

    if (!sharedSocket || !sharedSocket.connected) {
      sharedSocket = io(`${wsUrl}/events`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: {
          // JWT is sent via the HTTP-only cookie automatically via withCredentials
          // guestToken will be picked from cookie by the gateway
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    socketRef.current = sharedSocket;

    sharedSocket.on('connect', () => {
      console.log('[Socket.io] connected:', sharedSocket?.id);
    });

    sharedSocket.on('connect_error', (err) => {
      console.warn('[Socket.io] connection error:', err.message);
    });

    return () => {
      // Don't disconnect on unmount — keep shared connection alive
    };
  }, []);

  const on = useCallback(<K extends keyof EventMap>(event: K, handler: EventMap[K]) => {
    socketRef.current?.on(event as string, handler as any);
    return () => {
      socketRef.current?.off(event as string, handler as any);
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { socket: socketRef.current, on, emit };
}

export default useSocket;
