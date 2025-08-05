//jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * A guard that activates the 'jwt' Passport strategy to protect routes.
 *
 * When applied to a route, this guard invokes the `JwtStrategy`. The strategy
 * validates the JWT access token from the Authorization header. If the token is
 * valid, the payload returned from the strategy's `validate` method is attached
 * to `req.user`, and the request is allowed to proceed. If the token is invalid
 * or missing, an `UnauthorizedException` is thrown.
 *
 * @example
 * ```
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 * // req.user will contain { id: 'user-id-from-token' }
 * return this.userService.findOne(req.user.id);
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
