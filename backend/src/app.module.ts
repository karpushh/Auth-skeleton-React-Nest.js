import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdeasModule } from './ideas/ideas.module';
import { Idea } from './entities/idea.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the ConfigService available everywhere
      envFilePath: '.env', // Specifies the file to load
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here as well
      inject: [ConfigService], // Inject the ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Idea],
        synchronize: true, // Should be false in production
      }),
    }),
    UsersModule,
    AuthModule,
    IdeasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
