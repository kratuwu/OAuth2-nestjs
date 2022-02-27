import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/authentication/authentication.guard';
import RegisterDTO from 'src/users/dto/register.dto';
import RequestWithUser from 'src/requestWithUser.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  register(@Body() registrationData: RegisterDTO) {
    return this.usersService.create(registrationData);
  }

  @Get('/profile')
  @UseGuards(JwtAuthenticationGuard)
  getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfileById(req.user.id);
  }
}
