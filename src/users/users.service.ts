import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import ProfileDTO from './dto/profile.dto';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import UserDTO from './dto/user.dto';
import { UsersRepository } from './users.repository';
import RegisterDTO from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(register: RegisterDTO): Promise<ProfileDTO> {
    try {
      return plainToClass(
        ProfileDTO,
        await this.usersRepository.create(register),
      );
    } catch (error) {
      switch (error.code) {
        case 11000:
          throw new HttpException(
            'This dupplicated email',
            HttpStatus.CONFLICT,
          );
        default:
          throw new InternalServerErrorException();
      }
    }
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersRepository.updateUserPasswordById(userId, hashedPassword);
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.updateRefreshTokenById(
      userId,
      currentHashedRefreshToken,
    );
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    id: string,
  ): Promise<ProfileDTO> {
    const user = await this.usersRepository.getById(id);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return plainToClass(ProfileDTO, user);
    }
  }

  async getProfileById(id: string): Promise<ProfileDTO> {
    return plainToClass(ProfileDTO, await this.usersRepository.getById(id));
  }

  async getResetPasswordLink(email: string): Promise<string> {
    const user = await this.usersRepository.getByEmail(email);
    user.generatePasswordReset();
    await user.save();
    return `${this.configService.get(
      'FRONTEND_URL',
    )}/?action=resetPassword&reset_password_token=${user.resetPasswordToken}`;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.updateRefreshTokenById(userId, null);
  }

  async getUserById(id: string): Promise<UserDTO> {
    return plainToClass(UserDTO, await this.usersRepository.getById(id));
  }

  async getUserByEmail(email: string): Promise<UserDTO> {
    return plainToClass(UserDTO, await this.usersRepository.getByEmail(email));
  }

  async getUserByResetPasswordToken(resetToken: string): Promise<UserDTO> {
    return plainToClass(
      UserDTO,
      await this.usersRepository.getByResetPasswordToken(resetToken),
    );
  }
}
