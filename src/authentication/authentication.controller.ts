import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import RequestWithUser from 'src/requestWithUser.interface';
import { UsersService } from 'src/users/users.service';
import JwtRefreshGuard, {
  JwtAuthenticationGuard,
  LocalAuthenticationGuard,
} from './authentication.guard';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/login')
  @UseGuards(LocalAuthenticationGuard)
  async logIn(@Req() req: RequestWithUser) {
    const { user } = req;
    const accessToken = this.authenticationService.getAccessToken(user.id);
    const refreshToken = this.authenticationService.getRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    return { refreshToken, accessToken };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('/logout')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.usersService.removeRefreshToken(request.user.id);
    request.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
  }

  @Get('/refresh')
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() request: RequestWithUser) {
    return this.authenticationService.getAccessToken(request.user.id);
  }
}
