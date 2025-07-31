import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { Idea } from '../entities/idea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { IdeasController } from './ideas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Idea, User])],
  providers: [IdeasService],
  controllers: [IdeasController],
  exports: [IdeasService],
})
export class IdeasModule {}
