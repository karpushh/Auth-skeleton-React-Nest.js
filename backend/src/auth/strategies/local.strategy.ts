import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Passport strategy for validating user credentials using email and password.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for LocalStrategy.
   * @param authService - Service to validate user credentials.
   */
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * Validates the user's email and password.
   * @param email - User's email address.
   * @param password - User's password.
   * @returns The user object if validation succeeds.
   * @throws UnauthorizedException if validation fails.
   */
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
