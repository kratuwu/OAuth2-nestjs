import { AuthenticationService } from 'src/authentication/authentication.service';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.schema';
import * as bcrypt from 'bcrypt';
const mockedJwtService = {
  sign: () => '',
};
jest.mock('bcrypt');
jest.mock('src/users/users.service');
describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthenticationService,
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
      ],
    }).compile();
    authenticationService = await module.get(AuthenticationService);
    usersService = await module.get(UsersService);
  });
  describe('when creating a cookie', () => {
    it('should return a string', async () => {
      // Given
      const mockEmail = 'test@test.com';
      const mockUser: User = { email: mockEmail, password: 'passwordHash' };
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('passwordHash');
      // When
      await authenticationService.register({
        email: mockEmail,
        password: 'password',
      });
      // Then
      expect(usersService.create).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.password,
      );
    });
  });
});
