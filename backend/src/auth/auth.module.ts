import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, PassportModule, ConfigModule, JwtModule.register({})],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
