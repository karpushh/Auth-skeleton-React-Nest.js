//refresh.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * Extracts JWT refresh token from the httpOnly cookie.
 * @param req The incoming request object.
 * @returns The refresh token string or null.
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
 * Passport strategy for validating JWT refresh tokens sent via httpOnly cookies.
 * Uses the 'jwt-refresh' strategy name.
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  /**
   * Constructor for RefreshStrategy.
   * @param configService - Service to access environment variables.
   * @param usersService - Service to interact with user data.
   */
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
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
   * Validates the refresh token from the request cookie.
   * @param req - The incoming request object.
   * @param payload - JWT payload containing user info (e.g., { sub: string, email: string }).
   * @returns The user object with the refresh token if validation succeeds.
   * @throws UnauthorizedException if validation fails.
   */
  async validate(req: Request, payload: { sub: string }) {
    // The cookieExtractor already ran, but we need the raw token from the cookie for comparison.
    const refreshToken = req.cookies['refresh_token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Access Denied: No refresh token found in cookie.',
      );
    }

    const user = await this.usersService.findOne(payload.sub);

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
