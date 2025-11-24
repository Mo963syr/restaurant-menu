
import   {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import   type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  // دالة خاصة لضبط الكوكيز
  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true, // أهم شيء ضد XSS
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 دقيقة
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
      path: '/auth',
    });
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, ...rest } = await this.service.login(
      body.email,
      body.password,
    );

    this.setAuthCookies(res, accessToken, refreshToken);

    // ✅ لا نرجع الـ token في JSON أبداً
    return rest;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token cookie');
    }

    const { accessToken, refreshToken: newRefreshToken, ...rest } =
      await this.service.refresh(refreshToken);

    this.setAuthCookies(res, accessToken, newRefreshToken);

    return rest; // message فقط حالياً
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logout success' };
  }
}
