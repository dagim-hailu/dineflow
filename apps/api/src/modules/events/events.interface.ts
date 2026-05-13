import { OrderStatus } from '../order/models/order.model';

// order:new
export interface OrderPlacedEvent {
  orderId: string;
  tableId: string;
  restaurantId: string;
  items: Array<{ name: string; quantity: number }>;
  customerName?: string;
  customerAvatar?: string;
  totalAmount: number;
  createdAt: Date;
}

// order:status
export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  estimatedTime?: number; // minutes
}

// table:request
export interface TableRequestEvent {
  tableId: string;
  requestType: 'water' | 'bill' | 'service';
  timestamp: Date;
}

// WebSocket authentication payload
export interface WebSocketAuthPayload {
  userId?: string;
  sessionId?: string;
  role?: string;
  restaurantId?: string;
  tableId?: string;
}

// WebSocket connection metadata
export interface SocketMetadata {
  userId?: string;
  sessionId?: string;
  role: string;
  restaurantId?: string;
  tableId?: string;
  joinedRooms: Set<string>;
}
