import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import UserDTO from 'src/users/dto/user.dto';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserDTO => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
