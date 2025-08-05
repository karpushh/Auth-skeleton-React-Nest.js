//local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * A guard that activates the 'local' Passport strategy for authentication.
 *
 * When applied to a route handler (e.g., a login endpoint), this guard automatically
 * invokes the `LocalStrategy`. The `LocalStrategy` is responsible for extracting
 * credentials (like email and password) from the request and validating them.
 *
 * If validation is successful, Passport creates a `user` property on the request
 * object and passes control to the route handler. If validation fails, it
 * automatically throws an `UnauthorizedException`.
 *
 * @example
 * ```
 * @UseGuards(LocalAuthGuard)
 * @Post('login')
 * async login(@Request() req) {
 * return req.user; // The user object is attached by the guard
 * }
 * ```
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
