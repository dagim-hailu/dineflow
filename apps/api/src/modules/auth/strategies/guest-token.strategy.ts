import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { UserRole } from '../models/user.model';
import { AuthService } from '../auth.service';

@Injectable()
export class GuestTokenStrategy extends PassportStrategy(Strategy, 'guest-token') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(request: any): Promise<any> {
    try {
      const token = request.cookies?.dineflow_guest || request.headers?.['x-guest-token'];
      if (!token) {
        throw new UnauthorizedException('No guest token found');
      }

      const payload = this.authService.verifyGuestToken(token);

      // Return guest session information
      return {
        sessionId: payload.sessionId,
        tableId: payload.tableId,
        type: 'guest',
        role: UserRole.CUSTOMER,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid guest token');
    }
  }
}
