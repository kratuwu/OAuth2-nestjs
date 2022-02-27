import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import RegisterDTO from './dto/register.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
  ) {}

  async create(register: RegisterDTO): Promise<UserDocument> {
    return await this.usersModel.create(register);
  }

  async getByResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<UserDocument> {
    const user = await this.usersModel.findOne({ resetPasswordToken });
    if (user) {
      return user;
    }
    throw new HttpException('Invalid Token', HttpStatus.NOT_FOUND);
  }

  async getByEmail(email: string): Promise<UserDocument> {
    const user = await this.usersModel.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: string): Promise<UserDocument> {
    const user = await this.usersModel.findById(id);
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }
  async updateRefreshTokenById(userId: string, refreshToken: string) {
    return await this.usersModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: refreshToken,
    });
  }

  async updateUserPasswordById(userId: string, password: string) {
    return await this.usersModel.findByIdAndUpdate(userId, {
      password,
      resetPasswordToken: null,
      resetPasswordExp: null,
    });
  }
}
