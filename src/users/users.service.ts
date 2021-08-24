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
import UserDto from './dto/user.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
  ) {}
  async create(email: string, password: string) {
    try {
      const newUser: User = { email, password };
      return plainToClass(UserDto, await this.usersModel.create(newUser));
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
  async getByEmail(email: string): Promise<User> {
    const user = await this.usersModel.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    id: string,
  ): Promise<void> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersModel.findByIdAndUpdate(id, {
      currentHashedRefreshToken,
    });
  }
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return plainToClass(UserDto, user);
    }
  }
  async getProfileById(id: any) {
    const profile = await this.getById(id);
    if (profile) {
      return plainToClass(UserDto, profile);
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }
  private async getById(id: string) {
    return await this.usersModel.findById(id);
  }
}
