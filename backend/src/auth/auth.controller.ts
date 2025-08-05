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
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signup(res, createUserDto);
  }

  @UseGuards(LocalAuthGuard) //This guard sticks the user to the request
  @Post('login')
  async login(
    @Request() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(res, req.user);
  }

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

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Request() req: { user: User & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokens(res, req.user);
  }
}
