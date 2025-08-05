//auth.service.ts
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  /**
   * Initializes the AuthService with required dependencies.
   * @param jwtService - The JWT service for token generation.
   * @param configService - The configuration service for accessing environment variables.
   * @param userRepo - The repository for the User entity.
   */
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Registers a new user.
   * It checks if a user with the given email already exists, hashes the password,
   * creates and saves the new user, generates tokens, and sets the refresh token in a cookie.
   * @param res - The Express response object to set the cookie.
   * @param userDto - The user data for registration (username, email, password).
   * @returns An object containing the access token and user details.
   * @throws {ConflictException} If a user with the email already exists.
   */
  async signup(res: Response, userDto: SignupDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: userDto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const user = this.userRepo.create({ ...userDto, password: hashedPassword });
    await this.userRepo.save(user);
    const { access_token, refresh_token } = await this.getTokens(user.id);
    await this.updateUserRefreshToken(user.id, refresh_token);
    this.setRefreshTokenCookie(res, refresh_token);

    return {
      access_token: access_token,
      user: { username: user.username, email: user.email, id: user.id },
    };
  }

  /**
   * Logs in an existing user.
   * Generates new access and refresh tokens, updates the user's stored refresh token,
   * and sets the new refresh token in a cookie.
   * @param res - The Express response object to set the cookie.
   * @param user - The authenticated user object.
   * @returns An object containing the new access token and user details.
   */
  async login(res: Response, user: User) {
    const { access_token, refresh_token } = await this.getTokens(user.id);
    await this.updateUserRefreshToken(user.id, refresh_token);
    this.setRefreshTokenCookie(res, refresh_token);

    return {
      access_token,
      user: {
        email: user.email,
        username: user.username,
        id: user.id,
      },
    };
  }

  /**
   * Logs out a user.
   * It clears the refresh token from the database and removes the cookie from the client.
   * @param res - The Express response object to clear the cookie.
   * @param id - The ID of the user to log out.
   * @throws {NotFoundException} If the user is not found.
   */
  async logout(res: Response, id: string) {
    const user = await this.userRepo.findOneBy({ id });
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    if (!user) {
      throw new NotFoundException(`User not found!`);
    }
    Object.assign(user, { hashedRefreshToken: null });
    await this.userRepo.save(user);
    return;
  }

  /**
   * Finds a single user by a specified field (email or id).
   * @param type - The field to search by ('email' or 'id').
   * @param value - The value to match.
   * @returns The found user object.
   * @throws {NotFoundException} If no user is found.
   * @throws {InternalServerErrorException} For any other errors.
   */
  async findOne(type: 'email' | 'id', value: string) {
    try {
      const user = await this.userRepo.findOneBy({ [type]: value });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  /**
   * Hashes and saves a refresh token for a given user.
   * @param userId - The ID of the user.
   * @param refreshToken - The refresh token to save.
   */
  async updateUserRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.updateUser(userId, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }

  /**
   * Refreshes the access and refresh tokens for a user.
   * @param res - The Express response object to set the new cookie.
   * @param user - The user for whom to refresh tokens.
   * @returns An object containing the new access token and user details.
   */
  async refreshTokens(res: Response, user: User) {
    const { access_token, refresh_token } = await this.getTokens(user.id);
    await this.updateUserRefreshToken(user.id, refresh_token);

    this.setRefreshTokenCookie(res, refresh_token);

    return {
      access_token,
      user: {
        username: user.username,
        email: user.email,
        id: user.id,
      },
    };
  }

  /**
   * Generates JWT access and refresh tokens.
   * @param userId - The ID of the user for whom to generate tokens.
   * @returns An object containing the access_token and refresh_token.
   */
  async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
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

  /**
   * Sets the refresh token in an HTTP-only cookie.
   * This is a private helper method.
   * @param res - The Express response object.
   * @param refreshToken - The refresh token to set in the cookie.
   */
  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
      sameSite: 'strict',
      path: '/auth/refresh', // Important: Limit cookie scope
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  /**
   * Updates a user's attributes in the database.
   * This is a private helper method.
   * @param id - The ID of the user to update.
   * @param attrs - An object with the attributes to update.
   * @returns The updated user object.
   * @throws {NotFoundException} If the user is not found.
   */
  private async updateUser(id: string, attrs: Partial<User>) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  /**
   * Validates a user's credentials.
   * It finds the user by email and compares the provided password with the stored hash.
   * @param email - The user's email.
   * @param pass - The user's password.
   * @returns The user object without the password if validation is successful, otherwise null.
   */
  async validateUser(email: string, pass: string) {
    const user = await this.findOne('email', email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
