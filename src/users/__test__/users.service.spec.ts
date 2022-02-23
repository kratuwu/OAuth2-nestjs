import { Test } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user.schema';
import * as bcrypt from 'bcrypt';

describe('The UsersService', () => {
  let usersService: UsersService;
  let findOne: jest.Mock;
  let create: jest.Mock;
  let findById: jest.Mock;
  let findByIdAndUpdate: jest.Mock;
  let bcryptCompare: jest.Mock;
  beforeEach(async () => {
    findOne = jest.fn();
    create = jest.fn();
    findById = jest.fn();
    findByIdAndUpdate = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne,
            create,
            findById,
            findByIdAndUpdate,
          },
        },
      ],
    }).compile();
    usersService = await module.get(UsersService);
  });
  describe('when create user', () => {
    it('should return user', async () => {
      const user: User = { email: 'test@test.com', password: 'password' };

      create.mockReturnValue(Promise.resolve(user));
      await usersService.create(user.email, user.password);
      expect(create).toHaveBeenCalledWith({
        email: user.email,
        password: user.password,
      });
    });
  });

  describe('when getting a user by email', () => {
    describe('and the user is matched', () => {
      let user: User;
      beforeEach(() => {
        user = new User();
        findOne.mockReturnValue(Promise.resolve(user));
      });
      it('should return the user', async () => {
        const fetchedUser = await usersService.getByEmail('test@test.com');
        expect(fetchedUser).toEqual(user);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      });
      it('should throw an error', async () => {
        await expect(
          usersService.getByEmail('test@test.com'),
        ).rejects.toThrow();
      });
    });
  });
  describe('when getting a profile by id', () => {
    describe('and the user is matched', () => {
      let user: User;
      beforeEach(() => {
        user = new User();
        findById.mockResolvedValueOnce(user);
      });
      it('should return the user', async () => {
        const fetchedUser = await usersService.getProfileById('1');
        expect(fetchedUser).toEqual(user);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        findById.mockResolvedValueOnce(undefined);
      });
      it('should throw an error', async () => {
        await expect(usersService.getProfileById('test1')).rejects.toThrow();
      });
    });
  });
  describe('when set current refresh token', () => {
    let user: User;
    beforeEach(() => {
      user = new User();
      findByIdAndUpdate.mockReturnValue(user);
    });
    it('should return user', async () => {
      bcryptCompare = jest.fn().mockResolvedValueOnce('token');
      (bcrypt.hash as jest.Mock) = bcryptCompare;
      await usersService.setCurrentRefreshToken('mockToken', '1');
      expect(findByIdAndUpdate).toHaveBeenCalledWith('1', {
        currentHashedRefreshToken: 'token',
      });
    });
  });
  describe('when getting user if refresh token', () => {
    describe('is matched', () => {
      let user: User;
      beforeEach(() => {
        user = new User();
        findById.mockReturnValue(user);
      });
      it('should return the user', async () => {
        bcryptCompare = jest.fn().mockReturnValue(true);
        (bcrypt.compare as jest.Mock) = bcryptCompare;
        const fetchedUser = await usersService.getUserIfRefreshTokenMatches(
          'mockToken',
          '1',
        );
        expect(fetchedUser).toEqual(user);
      });
    });
    describe('is not matched', () => {
      it('should throw an error', async () => {
        bcryptCompare = jest.fn().mockReturnValue(false);
        (bcrypt.compare as jest.Mock) = bcryptCompare;
        await expect(
          usersService.getUserIfRefreshTokenMatches('mockToken', '1'),
        ).rejects.toThrow();
      });
    });
  });
});
