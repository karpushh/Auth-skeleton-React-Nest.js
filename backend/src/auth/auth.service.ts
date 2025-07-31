//auth.service.ts
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

/**
 * Service for authentication logic, including login, logout, token management, and user validation.
 */
@Injectable()
export class AuthService {
  /**
   * Constructor for AuthService.
   * @param usersService - Service to interact with user data.
   * @param jwtService - Service to handle JWT operations.
   * @param configService - Service to access environment variables.
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validates a user by email and password.
   * Used in LocalStrategy.validate.
   * @param email - User's email address.
   * @param pass - User's password.
   * @returns The user object without password if valid, otherwise null.
   */
  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Generates new access and refresh tokens for a user and updates the stored refresh token.
   * @param userId - The user's ID.
   * @returns The new access and refresh tokens.
   */
  async refreshTokens(userId: string /* , email: string */) {
    const tokens = await this.getTokens(userId);
    await this.updateUserRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }

  /**
   * Logs out the user by removing their stored refresh token.
   * @param userId - The user's ID.
   * @returns The result of the user update operation.
   */
  async logout(userId: string) {
    return this.usersService.update(userId, { hashedRefreshToken: null });
  }

  /**
   * Logs in the user and generates access and refresh tokens.
   * @param user - The user object containing at least the ID.
   * @returns The access and refresh tokens.
   */
  async login(user: Pick<User, 'id' /* | 'email' */>) {
    const tokens = await this.getTokens(user.id);
    await this.updateUserRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Updates the user's stored refresh token with a hashed version.
   * @param userId - The user's ID.
   * @param refreshToken - The new refresh token to store.
   */
  async updateUserRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }

  /**
   * Generates access and refresh JWT tokens for a user.
   * @param userId - The user's ID.
   * @returns An object containing access_token and refresh_token.
   */
  async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId /* , email */ },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId /* , email */ },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
