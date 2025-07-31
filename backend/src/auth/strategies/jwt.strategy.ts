import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Interface representing the payload of a JWT.
 * @property sub - Subject (the user ID)
 * @property iat - Issued at (optional)
 * @property exp - Expiration time (optional)
 */
export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}
/**
 * Passport strategy for validating JWT access tokens.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for JwtStrategy.
   * @param configService - Service to access environment variables.
   * @throws Error if JWT_ACCESS_SECRET is not defined.
   */
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_SECRET is not defined in the environment variables.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validates the JWT payload and returns the user object.
   * @param payload - The decoded JWT payload.
   * @returns An object containing the user ID.
   */
  validate(payload: JwtPayload) {
    return { id: payload.sub };
  }
}
