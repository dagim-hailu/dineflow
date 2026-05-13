import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createHmac, timingSafeEqual } from 'crypto';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { users } from '../../infrastructure/database/schema';
import { eq, ilike, or, sql, count, and } from 'drizzle-orm';
import { UserRole } from './models/user.model';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface GuestTokenPayload {
  sessionId: string;
  tableId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly guestTokenSecret: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {
    this.guestTokenSecret = process.env.GUEST_TOKEN_SECRET || 'default-guest-secret';
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const [user] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { passwordHash, name, ...result } = user;
      return { ...result, name, displayName: name };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(input: {
    email: string;
    password: string;
    displayName: string;
    role?: UserRole;
  }): Promise<any> {
    try {
      // Check if user already exists
      const [existingUser] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(input.password, saltRounds);

      // Create user
      const [newUser] = await this.databaseService.db
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          name: input.displayName,
          role: input.role || UserRole.CUSTOMER,
        })
        .returning();

      const { passwordHash: _, name, ...user } = newUser;
      return { ...user, name, displayName: name };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to register user');
    }
  }

  async login(user: any): Promise<{ accessToken: string; user: any }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Different expiry based on role
    const expiresIn = user.role === UserRole.CUSTOMER ? '30d' : '24h';

    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      accessToken,
      user,
    };
  }

  generateGuestToken(tableId: string): { token: string; sessionId: string; expiresAt: Date } {
    const sessionId = uuidv4();
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 15 * 60; // 15 minutes

    const payload: GuestTokenPayload = {
      sessionId,
      tableId,
      iat,
      exp,
    };

    // Create HMAC signature
    const hmac = createHmac('sha256', this.guestTokenSecret);
    hmac.update(JSON.stringify(payload));
    const signature = hmac.digest('hex');

    // Combine payload and signature
    const token = `${Buffer.from(JSON.stringify(payload)).toString('base64')}.${signature}`;

    return {
      token,
      sessionId,
      expiresAt: new Date(exp * 1000),
    };
  }

  verifyGuestToken(token: string): GuestTokenPayload {
    try {
      const [encodedPayload, signature] = token.split('.');

      if (!encodedPayload || !signature) {
        throw new UnauthorizedException('Invalid guest token format');
      }

      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64').toString(),
      ) as GuestTokenPayload;

      // Verify expiry
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new UnauthorizedException('Guest token expired');
      }

      // Verify signature
      const hmac = createHmac('sha256', this.guestTokenSecret);
      hmac.update(JSON.stringify(payload));
      const expectedSignature = hmac.digest('hex');

      if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new UnauthorizedException('Invalid guest token signature');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid guest token');
    }
  }

  async findUserById(id: string): Promise<any> {
    try {
      const [user] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return null;
      }

      const { passwordHash, name, ...result } = user;
      return { ...result, name, displayName: name };
    } catch (error) {
      return null;
    }
  }

  async updateProfile(
    userId: string,
    input: { displayName?: string; profileImageUrl?: string; preferences?: string },
  ): Promise<any> {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (input.displayName !== undefined) updateData.name = input.displayName;
    if (input.profileImageUrl !== undefined) updateData.profileImageUrl = input.profileImageUrl;
    // preferences stored in profileImageUrl column not available; store in a future column
    // For now we just update name and profileImageUrl

    const [updated] = await this.databaseService.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updated) throw new Error('User not found');
    const { passwordHash, name, ...rest } = updated;
    return { ...rest, name, displayName: name };
  }

  async getPaginatedUsers(args: {
    search?: string;
    role?: UserRole;
    limit: number;
    offset: number;
  }) {
    const conditions = [];

    if (args.search) {
      conditions.push(
        or(ilike(users.name, `%${args.search}%`), ilike(users.email, `%${args.search}%`)),
      );
    }

    if (args.role) {
      conditions.push(eq(users.role, args.role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountResult] = await this.databaseService.db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const items = await this.databaseService.db
      .select()
      .from(users)
      .where(whereClause)
      .limit(args.limit)
      .offset(args.offset)
      .orderBy(users.createdAt);

    return {
      items: items.map((user) => {
        const { passwordHash, name, ...result } = user;
        return { ...result, name, displayName: name, role: result.role as UserRole };
      }),
      totalCount: Number(totalCountResult.count),
    };
  }
}
