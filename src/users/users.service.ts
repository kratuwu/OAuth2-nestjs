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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async create(email: string, password: string) {
    try {
      const newUser: User = { email, password };
      return plainToClass(ProfileDTO, await this.usersModel.create(newUser));
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
  async updatePassword(userId: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      resetPasswordExp: null,
      resetPasswordToken: null,
    });
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.getById(id);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return plainToClass(ProfileDTO, user);
    }
  }

  async getProfileById(id: string): Promise<ProfileDTO> {
    return plainToClass(ProfileDTO, await this.getById(id));
  }

  async getResetPasswordLink(email: string): Promise<string> {
    const user = await this.getByEmail(email);
    user.generatePasswordReset();
    await user.save();
    return `${this.configService.get(
      'FRONTEND_URL',
    )}/?action=resetPassword&reset_password_token=${user.resetPasswordToken}`;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.usersModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserById(id: string): Promise<UserDTO> {
    return plainToClass(UserDTO, await this.getById(id));
  }

  async getUserByEmail(email: string): Promise<UserDTO> {
    return plainToClass(UserDTO, await this.getByEmail(email));
  }

  async getUserByResetPasswordToken(resetToken: string) {
    return plainToClass(
      UserDTO,
      await this.getByResetPasswordToken(resetToken),
    );
  }

  private async getByResetPasswordToken(resetPasswordToken: string) {
    const user = await this.usersModel.findOne({ resetPasswordToken });
    if (user) {
      return user;
    }
    throw new HttpException('Invalid Token', HttpStatus.NOT_FOUND);
  }
  private async getByEmail(email: string): Promise<UserDocument> {
    const user = await this.usersModel.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  private async getById(id: string): Promise<UserDocument> {
    const user = await this.usersModel.findById(id);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }
}
