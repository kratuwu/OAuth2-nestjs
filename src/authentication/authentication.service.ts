import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import UserDTO from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  public async updateAuthToken(userId: string) {
    const currentRefreshToken = this.getRefreshToken(userId);
    const currentAccessToken = this.getAccessToken(userId);
    this.usersService.setCurrentRefreshToken(currentRefreshToken, userId);
    return {
      accessToken: currentAccessToken,
      refreshToken: currentRefreshToken,
    };
  }

  public async login(email: string, plainTextPassword: string) {
    const user = await this.usersService.getUserByEmail(email);
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  public async resetPassword(resetPasswordToken: string, password: string) {
    const user: UserDTO = await this.usersService.getUserByResetPasswordToken(
      resetPasswordToken,
    );
    this.verifyResetPasswordToken(user, resetPasswordToken);
    this.usersService.updatePassword(user.id, password);
  }

  public verifyResetPasswordToken(user: UserDTO, resetToken: string) {
    if (
      !user.resetPasswordToken &&
      user.resetPasswordToken !== resetToken &&
      Date.now() > user.resetPasswordExp
    ) {
      throw new HttpException(
        'Reset password link was expired',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  public getAccessToken(userId: any): string {
    return this.getJWT(
      userId,
      this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    );
  }

  public getRefreshToken(userId: any): string {
    return this.getJWT(
      userId,
      this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    );
  }

  private getJWT(secret: string, userId: string, expireTime: number) {
    return this.jwtService.sign(
      { userId },
      {
        secret: secret,
        expiresIn: `${expireTime}s`,
      },
    );
  }
}
