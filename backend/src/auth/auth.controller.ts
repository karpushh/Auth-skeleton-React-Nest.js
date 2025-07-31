//auth.controller.ts
import { UsersService } from 'src/users/users.service';
import {
  Controller,
  Get,
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

/**
 * Controller for authentication endpoints: signup, login, logout, refresh tokens, and profile.
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor for AuthController.
   * @param authService - Service for authentication logic.
   * @param usersService - Service for user management.
   */
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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
   * Refreshes access and refresh tokens for the authenticated user. Requires a valid refresh token.
   * @param req - The request object containing the user.
   * @returns Access token and user object containing email and username
   */
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Request() req: { user: User & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    // The user object now contains the old refresh token from the guard
    const { access_token, refresh_token: newRefreshToken } =
      await this.authService.refreshTokens(req.user.id);

    this.setRefreshTokenCookie(res, newRefreshToken);

    return {
      access_token,
      user: {
        username: req.user.username,
        email: req.user.email,
        id: req.user.id,
      },
    };
  }

  /**
   * Registers a new user and logs them in.
   * @param createUserDto - Data transfer object for creating a user.
   * @returns Access token and user object containing email and username

   */
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.create(createUserDto);
    const { access_token, refresh_token } = await this.authService.login(user);
    this.setRefreshTokenCookie(res, refresh_token);
    return {
      access_token: access_token,
      user: { username: user.username, email: user.email, id: user.id },
    };
  }

  /**
   * Logs in a user using local authentication.
   * @param req - The request object containing the user. Comes from the local auth guard
   * @returns Access token and user object containing email and username
   */
  @UseGuards(LocalAuthGuard) //This guard sticks the user to the request
  @Post('login')
  async login(
    @Request() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user,
    );
    this.setRefreshTokenCookie(res, refresh_token);

    return {
      access_token,
      user: {
        email: req.user.email,
        username: req.user.username,
        id: req.user.id,
      },
    };
  }

  /**
   * Logs out the authenticated user by invalidating their refresh token.
   * @param req - The request object containing the user ID.
   *@returns nothing
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Request() req: { user: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    await this.authService.logout(userId);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return;
  }

  /**
   * Returns the profile of the authenticated user.
   * @param req - The request object containing the user.
   * @returns The user profile.
   */
  @UseGuards(JwtAuthGuard) //might expose sensitive data !!!!!!!!!!!
  @Get('profile')
  async getProfile(@Request() req: { user: User }) {
    return await this.usersService.findOne(req.user.id);
  }
}
