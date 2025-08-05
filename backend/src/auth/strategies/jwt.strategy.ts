import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Defines the structure of the JWT payload.
 * This interface is used for type-checking the decoded token.
 */
export interface JwtPayload {
  /**
   * The subject of the token, which is the user's unique identifier (ID).
   */
  sub: string;
  /**
   * The 'issued at' timestamp, indicating when the token was created.
   * Represented as seconds since the Unix epoch.
   */
  iat?: number;
  /**
   * The expiration timestamp, indicating when the token will expire.
   * Represented as seconds since the Unix epoch.
   */
  exp?: number;
}

/**
 * Implements the standard JWT authentication strategy for Passport.
 * This strategy is responsible for validating the JWT access token sent in the
 * Authorization header of a request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes the JWT strategy.
   * It configures how to extract the token from the request and the secret key to use for verification.
   * @param configService - Service for accessing configuration and environment variables.
   */
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_SECRET is not defined in the environment variables.',
      );
    }
    super({
      // Specifies that the token should be extracted from the 'Authorization: Bearer <token>' header.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ensures that the token's expiration is checked. If expired, the request will be denied.
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validates the payload of a decoded JWT.
   * This method is called by Passport after successfully verifying the token's signature and expiration.
   * The value returned here is attached to the `user` property of the request object.
   * @param payload - The decoded JWT payload.
   * @returns An object containing the user's ID, which will be attached to the request.
   */
  validate(payload: JwtPayload) {
    // We trust the token is valid at this point, so we just return the essential user info.
    // This can be expanded to include roles or other user properties if they are in the payload.
    return { id: payload.sub };
  }
}
