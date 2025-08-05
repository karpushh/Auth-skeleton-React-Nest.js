//auth.controller.ts
import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  /**
   * Initializes the AuthController with the AuthService.
   * @param authService - The authentication service.
   */
  constructor(private authService: AuthService) {}

  /**
   * Handles user registration.
   * POST /auth/signup
   * @param createUserDto - The user data from the request body.
   * @param res - The Express response object, used to set cookies.
   * @returns The result of the signup process from the AuthService.
   */
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signup(res, createUserDto);
  }

  /**
   * Handles user login.
   * POST /auth/login
   * @param req - The Express request object, containing the authenticated user.
   * @param res - The Express response object, used to set cookies.
   * @returns The result of the login process from the AuthService.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(res, req.user);
  }

  /**
   * Handles user logout.
   * POST /auth/logout
   * @param req - The Express request object, containing the user's JWT payload.
   * @param res - The Express response object, used to clear cookies.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Request() req: { user: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    await this.authService.logout(res, userId);
    return;
  }

  /**
   * Handles refreshing authentication tokens.
   * POST /auth/refresh
   * @param req - The Express request object, containing the user and their refresh token.
   * @param res - The Express response object, used to set the new refresh token cookie.
   * @returns The result of the token refresh process from the AuthService.
   */
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Request() req: { user: User & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokens(res, req.user);
  }
}
