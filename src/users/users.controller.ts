import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/authentication/authentication.guard';
import RegisterDTO from 'src/users/dto/register.dto';
import RequestWithUser from 'src/requestWithUser.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async register(@Body() registrationData: RegisterDTO) {
    await this.usersService.create(registrationData);
  }

  @Get('/profile')
  @UseGuards(JwtAuthenticationGuard)
  async getProfile(@Req() req: RequestWithUser) {
    return await this.usersService.getProfileById(req.user.id);
  }
}
