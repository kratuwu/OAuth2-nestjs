import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import RequestWithUser from 'src/requestWithUser.interface';
import UserDTO from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import {
  JwtRefreshGuard,
  JwtAuthenticationGuard,
  LocalAuthenticationGuard,
} from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import ForgotPasswordDTO from './dto/ForgotPassword.dto';
import ResetPasswordDTO from './dto/resetPassword.dto';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/login')
  @UseGuards(LocalAuthenticationGuard)
  logIn(@GetUser() user: UserDTO) {
    return this.authenticationService.updateAuthToken(user.id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('/logout')
  logOut(@GetUser() user: UserDTO) {
    return this.usersService.removeRefreshToken(user.id);
  }

  @Get('/refresh')
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() request: RequestWithUser) {
    return this.authenticationService.getAccessToken(request.user.id);
  }

  @Post('/forgot')
  getResetPasswordLink(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    return this.usersService.getResetPasswordLink(forgotPasswordDto.email);
  }

  @Get('/reset')
  resetPassword(
    @Headers('ResetToken') resetToken: string,
    @Body() request: ResetPasswordDTO,
  ) {
    return this.authenticationService.resetPassword(
      resetToken,
      request.password,
    );
  }
}
