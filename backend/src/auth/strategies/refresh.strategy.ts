//refresh.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';

/**
 * Extracts the refresh token from the 'refresh_token' cookie in an HTTP request.
 * This function is designed to be used with Passport's `jwtFromRequest` option.
 * @param req - The Express request object.
 * @returns The refresh token string if found and is a string, otherwise null.
 */
const cookieExtractor = (req: Request): string | null => {
  // Use optional chaining and a type check for type safety.
  const refreshToken = req.cookies?.['refresh_token'];
  if (typeof refreshToken === 'string') {
    return refreshToken;
  }
  return null;
};

/**
 * Implements the JWT refresh token strategy for Passport.
 * This strategy is responsible for validating a user's refresh token, which is
 * expected to be in an HTTP-only cookie. It ensures the token is valid, not
 * compromised, and belongs to an existing user.
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    /**
     * Initializes the refresh token strategy.
     * @param configService - Service for accessing configuration and environment variables.
     * @param authService - Service for user-related database operations.
     */
    configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in the environment variables.',
      );
    }

    super({
      // Use our custom extractor to get the token from the cookie
      jwtFromRequest: cookieExtractor,
      secretOrKey: secret,
      // Pass the request object to the validate method so we can access the cookie again
      passReqToCallback: true,
    });
  }

  /**
   * Validates the refresh token payload.
   * This method is called by Passport after it successfully decodes the JWT.
   * It verifies that the token from the cookie matches the hashed token stored for the user.
   * @param req - The Express request object, passed via `passReqToCallback: true`.
   * @param payload - The decoded JWT payload, containing the user's ID (`sub`).
   * @returns The user object, augmented with the raw refresh token.
   * @throws {UnauthorizedException} If the token is missing, the user is not found,
   * or the token does not match the stored hash.
   */
  async validate(req: Request, payload: { sub: string }) {
    // The cookieExtractor already ran, but we need the raw token from the cookie for comparison.
    const refreshToken = req.cookies['refresh_token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Access Denied: No refresh token found in cookie.',
      );
    }

    const user = await this.authService.findOne('id', payload.sub);

    // Check if user exists and has a stored hashed refresh token
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException(
        'Access Denied: User not found or no refresh token stored.',
      );
    }

    // Compare the incoming token with the stored hash
    const tokensMatch = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!tokensMatch) {
      throw new UnauthorizedException('Access Denied: Refresh token mismatch.');
    }

    // Attach the refresh token to the user object for use in the refresh endpoint
    return { ...user, refreshToken };
  }
}
