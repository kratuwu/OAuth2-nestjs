import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: `mongodb://${configService.get(
            'MONGO_HOST',
          )}:${configService.get('MONGO_PORT')}`,
          user: configService.get('MONGO_USER'),
          pass: configService.get('MONGO_PASS'),
          useFindAndModify: false,
          useCreateIndex: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
