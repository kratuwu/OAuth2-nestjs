import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthenticationGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {}

@Injectable()
export default class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {}
