import {
  Controller,
  Req,
  UseGuards,
  Post,
  HttpCode,
  Body,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication/authentication.service';
import RegisterDto from './authentication/dto/register.dto';
import JwtRefreshGuard, {
  LocalAuthenticationGuard,
  JwtAuthenticationGuard,
} from './authentication/authentication.guard';
import RequestWithUser from './requestWithUser.interface';

@Controller()
export class AppController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registrationData: RegisterDto) {
    await this.authenticationService.register(registrationData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthenticationGuard)
  async logIn(@Req() req: RequestWithUser) {
    const { user } = req;
    const accessToken = this.authenticationService.getAccessToken(user.id);
    const refreshToken = this.authenticationService.getRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    return { refreshToken, accessToken };
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  async getProfile(@Req() req: RequestWithUser) {
    return await this.usersService.getProfileById(req.user);
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() request: RequestWithUser) {
    return this.authenticationService.getAccessToken(request.user.id);
  }
}
