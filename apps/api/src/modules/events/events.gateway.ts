import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { AuthService } from '../auth/auth.service';
import type {
  WebSocketAuthPayload,
  SocketMetadata,
  OrderPlacedEvent,
  OrderStatusEvent,
  TableRequestEvent,
} from './events.interface';

const DEFAULT_SOCKET_ORIGINS = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:3000',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
] as const;

function parseSocketOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL;
  if (!raw) {
    return [...DEFAULT_SOCKET_ORIGINS];
  }
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) {
    return [...DEFAULT_SOCKET_ORIGINS];
  }
  if (list.length === 1) return list[0]!;
  return list;
}

@WebSocketGateway({
  cors: {
    origin: parseSocketOrigins(),
    credentials: true,
  },
  namespace: '/events',
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly connectedClients = new Map<string, SocketMetadata>();

  constructor(
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async afterInit(server: Server) {
    this.logger.log('WebSocket gateway initialized');

    // Setup Redis adapter for horizontal scaling
    await this.setupRedisAdapter(server);
  }

  private async setupRedisAdapter(server: Server) {
    try {
      const { createAdapter } = await import('@socket.io/redis-adapter');
      const { createClient } = await import('redis');

      const pubClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      server.adapter(createAdapter(pubClient, subClient));

      this.logger.log('Redis adapter for Socket.io initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis adapter:', error);
      this.logger.warn('WebSocket server running without Redis adapter (not scalable)');
    }
  }

  async handleConnection(socket: Socket) {
    try {
      // Authenticate connection using JWT or guest token
      const authPayload = await this.authenticateSocket(socket);

      if (!authPayload) {
        socket.disconnect(true);
        return;
      }

      // Store connection metadata
      const metadata: SocketMetadata = {
        userId: authPayload.userId,
        sessionId: authPayload.sessionId,
        role: authPayload.role || 'guest',
        restaurantId: authPayload.restaurantId,
        tableId: authPayload.tableId,
        joinedRooms: new Set(),
      };

      this.connectedClients.set(socket.id, metadata);

      // Join appropriate rooms based on user role and context
      await this.joinRelevantRooms(socket, metadata);

      this.logger.log(`Client connected: ${socket.id}, role: ${metadata.role}`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    const metadata = this.connectedClients.get(socket.id);
    if (metadata) {
      this.logger.log(`Client disconnected: ${socket.id}, role: ${metadata.role}`);
      this.connectedClients.delete(socket.id);
    }
  }

  private async authenticateSocket(socket: Socket): Promise<WebSocketAuthPayload | null> {
    try {
      // Try JWT token first (for authenticated users)
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          return {
            userId: payload.sub,
            role: payload.role,
            restaurantId: payload.restaurantId,
          };
        } catch (jwtError) {
          this.logger.warn('JWT authentication failed:', jwtError);
        }
      }

      // Try guest token (for anonymous users)
      const guestToken = socket.handshake.auth.guestToken;
      if (guestToken) {
        try {
          const payload = this.authService.verifyGuestToken(guestToken);
          return {
            sessionId: payload.sessionId,
            role: 'customer',
            tableId: payload.tableId,
            // restaurantId would need to be determined from tableId
          };
        } catch (guestError) {
          this.logger.warn('Guest token authentication failed:', guestError);
        }
      }

      // If no valid authentication, reject connection
      this.logger.warn('No valid authentication provided for socket:', socket.id);
      return null;
    } catch (error) {
      this.logger.error('Authentication error:', error);
      return null;
    }
  }

  private async joinRelevantRooms(socket: Socket, metadata: SocketMetadata) {
    // Join room based on user role
    if (metadata.role === 'customer' && metadata.tableId) {
      socket.join(`table:${metadata.tableId}`);
      metadata.joinedRooms.add(`table:${metadata.tableId}`);
    }

    if (metadata.restaurantId) {
      // All staff join restaurant room
      if (['waiter', 'kitchen', 'manager', 'admin'].includes(metadata.role)) {
        socket.join(`restaurant:${metadata.restaurantId}`);
        metadata.joinedRooms.add(`restaurant:${metadata.restaurantId}`);
      }

      // Kitchen staff join kitchen room
      if (metadata.role === 'kitchen') {
        socket.join(`kitchen:${metadata.restaurantId}`);
        metadata.joinedRooms.add(`kitchen:${metadata.restaurantId}`);
      }

      // Waiters join their specific room
      if (metadata.role === 'waiter' && metadata.userId) {
        socket.join(`waiter:${metadata.userId}`);
        metadata.joinedRooms.add(`waiter:${metadata.userId}`);
      }
    }

    // Join global room for system notifications
    socket.join('system:notifications');
    metadata.joinedRooms.add('system:notifications');
  }

  // Event emission methods
  emitOrderPlaced(event: OrderPlacedEvent) {
    this.server.to(`restaurant:${event.restaurantId}`).emit('order:new', event);

    // Also emit to kitchen specifically
    this.server.to(`kitchen:${event.restaurantId}`).emit('order:new', event);

    this.logger.log(`Order placed event emitted: ${event.orderId}`);
  }

  emitOrderStatusChanged(event: OrderStatusEvent & { restaurantId: string }) {
    // Emit to restaurant staff
    this.server.to(`restaurant:${event.restaurantId}`).emit('order:status', event);

    this.logger.log(`Order status changed: ${event.orderId} -> ${event.status}`);
  }

  emitTableRequest(event: TableRequestEvent & { restaurantId: string }) {
    // Emit to all waiters in the restaurant
    this.server.to(`restaurant:${event.restaurantId}`).emit('table:request', event);

    this.logger.log(`Table request: ${event.tableId} - ${event.requestType}`);
  }

  // Event handlers for client-originated events
  @SubscribeMessage('table:request')
  handleTableRequest(socket: Socket, data: TableRequestEvent) {
    const metadata = this.connectedClients.get(socket.id);
    if (!metadata || metadata.role !== 'customer') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    // Add restaurantId from client metadata
    const eventWithRestaurant = {
      ...data,
      restaurantId: metadata.restaurantId!,
    };

    this.emitTableRequest(eventWithRestaurant);
  }

  @SubscribeMessage('order:acknowledge')
  handleOrderAcknowledge(socket: Socket, data: { orderId: string }) {
    const metadata = this.connectedClients.get(socket.id);
    if (!metadata || !['waiter', 'kitchen', 'manager'].includes(metadata.role)) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    this.logger.log(
      `Order acknowledged: ${data.orderId} by ${metadata.role}:${metadata.userId || metadata.sessionId}`,
    );
  }

  // Utility methods
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getRestaurantClients(restaurantId: string): number {
    return Array.from(this.connectedClients.values()).filter(
      (client) => client.restaurantId === restaurantId,
    ).length;
  }
}
