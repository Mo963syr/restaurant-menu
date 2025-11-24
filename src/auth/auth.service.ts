import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// مهم: غيّرها وطلعها على .env في الإنتاج
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET_CHANGE_ME';

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_SECRET_CHANGE_ME';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwt: JwtService,
  ) {}

  // توليد access + refresh
  private async signTokens(payload: JwtPayload) {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: '50s', // access token قصير
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: '7d', // refresh token أطول
    });

    return { accessToken, refreshToken };
  }

  // تسجيل الدخول
  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = await this.signTokens(payload);

    return {
      message: 'Login success',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant ?? null,
      },
    };
  }

  // تجديد التوكنات عن طريق refresh_token من الكوكيز
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: JwtPayload;
    try {
      payload = (await this.jwt.verifyAsync(refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      })) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // (اختياري لكن أفضل) نتأكد أن المستخدم ما زال موجوداً
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const newPayload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await this.signTokens(newPayload);

    return {
      message: 'Tokens refreshed',
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
