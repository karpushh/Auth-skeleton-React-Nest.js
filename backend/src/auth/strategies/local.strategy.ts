//local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Implements the local authentication strategy using Passport.
 * This strategy validates users based on email and password.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes the strategy with the AuthService and configures the username field.
   * @param authService - The service responsible for user validation.
   */
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * Validates the user's credentials.
   * This method is automatically called by Passport when the local strategy is used.
   * @param email - The email provided by the user.
   * @param password - The password provided by the user.
   * @returns The user object if the credentials are valid.
   * @throws {UnauthorizedException} If the credentials are invalid.
   */
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
