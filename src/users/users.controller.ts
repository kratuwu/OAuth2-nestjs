import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/authentication/authentication.guard';
import RegisterDto from 'src/authentication/dto/register.dto';
import RequestWithUser from 'src/requestWithUser.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async register(@Body() registrationData: RegisterDto) {
    await this.usersService.create(
      registrationData.email,
      registrationData.password,
    );
  }

  @Get('/profile')
  @UseGuards(JwtAuthenticationGuard)
  async getProfile(@Req() req: RequestWithUser) {
    console.log(req.user);
    return await this.usersService.getProfileById(req.user.id);
  }
}
