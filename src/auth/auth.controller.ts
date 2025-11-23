import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.service.login(body.email, body.password);
  }
}
