import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authenticationService: AuthenticationService,
    private usersService: UsersService,
  ) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string) {
    return await this.authenticationService.login(email, password);
  }
}
