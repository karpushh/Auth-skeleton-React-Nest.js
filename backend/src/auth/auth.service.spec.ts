import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      update: jest.fn(),
    };
    const mockJwtService = {
      signAsync: jest.fn(),
    };
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if valid', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashed' };
      usersService.findOneByEmail = jest.fn().mockResolvedValue(user);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toEqual({ id: 1, email: 'test@test.com' });
    });
    it('should return null if user not found', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue(null);
      const result = await service.validateUser(
        'notfound@test.com',
        'password',
      );
      expect(result).toBeNull();
    });
    it('should return null if password invalid', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashed' };
      usersService.findOneByEmail = jest.fn().mockResolvedValue(user);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);
      const result = await service.validateUser('test@test.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and update refresh token', async () => {
      const tokens = { access_token: 'access', refresh_token: 'refresh' };
      service.getTokens = jest.fn().mockResolvedValue(tokens);
      service.updateUserRefreshToken = jest.fn().mockResolvedValue(undefined);
      const result = await service.login({ id: 1 });
      expect(result).toEqual(tokens);
      expect(service.updateUserRefreshToken).toHaveBeenCalledWith(1, 'refresh');
    });
  });

  describe('logout', () => {
    it('should call usersService.update with null refresh token', async () => {
      usersService.update = jest.fn().mockResolvedValue({});
      await service.logout(1);
      expect(usersService.update).toHaveBeenCalledWith(1, {
        hashedRefreshToken: null,
      });
      expect(usersService.update).toHaveBeenCalledWith(1, {
        hashedRefreshToken: null,
      });
    });
  });

  describe('refreshTokens', () => {
    it('should get new tokens and update refresh token', async () => {
      const tokens = { access_token: 'access', refresh_token: 'refresh' };
      service.getTokens = jest.fn().mockResolvedValue(tokens);
      service.updateUserRefreshToken = jest.fn().mockResolvedValue(undefined);
      const result = await service.refreshTokens(1);
      expect(result).toEqual(tokens);
      expect(service.updateUserRefreshToken).toHaveBeenCalledWith(1, 'refresh');
    });
  });

  describe('updateUserRefreshToken', () => {
    it('should hash refresh token and update user', async () => {
      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashedRefresh');
      usersService.update = jest.fn().mockResolvedValue({});
      await service.updateUserRefreshToken(1, 'refresh');
      expect(bcrypt.hash).toHaveBeenCalledWith('refresh', 10);
      expect(usersService.update).toHaveBeenCalledWith(1, {
        hashedRefreshToken: 'hashedRefresh',
      });
      expect(usersService.update).toHaveBeenCalledWith(1, {
        hashedRefreshToken: 'hashedRefresh',
      });
    });
  });

  describe('getTokens', () => {
    it('should return access and refresh tokens', async () => {
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh');
      configService.get = jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'JWT_ACCESS_SECRET' ? 'accessSecret' : 'refreshSecret',
        );
      const result = await service.getTokens(1);
      expect(result).toEqual({
        access_token: 'access',
        refresh_token: 'refresh',
      });
    });
  });
});
