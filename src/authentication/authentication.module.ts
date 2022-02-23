import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';

import { AuthenticationService } from './authentication.service';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [ConfigModule, JwtModule.register({}), PassportModule, UsersModule],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
  ],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
