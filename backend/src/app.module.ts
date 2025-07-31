import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { IdeasModule } from './ideas/ideas.module';
import { Idea } from './entities/idea.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'money',
      username: 'postgres',
      password: 'karpush987',
      entities: [User, Idea], //entities you want to register
      synchronize: true, //dev
    }),
    ConfigModule.forRoot({
      isGlobal: true, // This makes the ConfigService available everywhere
      envFilePath: '.env', // Specifies the file to load
    }),
    UsersModule,
    AuthModule,
    IdeasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
