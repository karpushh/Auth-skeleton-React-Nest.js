//refresh-token.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * A guard that activates the 'jwt-refresh' Passport strategy.
 *
 * This guard should be used to protect the token refresh endpoint. It triggers the
 * `RefreshStrategy`, which validates the refresh token from the request cookie.
 * If the token is valid, the user object (including the refresh token) is
 * attached to the request, and access is granted.
 *
 * @example
 * ```
 * @UseGuards(RefreshTokenGuard)
 * @Post('refresh')
 * async refreshTokens(@Request() req) {
 * // req.user contains the user and their validated refresh token
 * return this.authService.refreshTokens(req.user);
 * }
 * ```
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
