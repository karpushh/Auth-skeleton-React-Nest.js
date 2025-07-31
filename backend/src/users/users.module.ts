import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersController } from './users.controller';
import { IdeasModule } from 'src/ideas/ideas.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), IdeasModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
