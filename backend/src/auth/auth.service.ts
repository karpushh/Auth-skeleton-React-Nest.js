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
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

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

  async logout(res: Response, id: string) {
    const user = await this.userRepo.findOneBy({ id });
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    if (!user) {
      throw new Error(`User not found!`);
    }
    Object.assign(user, { hashedRefreshToken: null });
    await this.userRepo.save(user);
    return;
  }

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

  async updateUserRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.updateUser(userId, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }
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

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
      sameSite: 'strict',
      path: '/auth/refresh', // Important: Limit cookie scope
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  private async updateUser(id: string, attrs: Partial<User>) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.findOne('email', email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
