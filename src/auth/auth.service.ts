import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid email or password');

    // إنشاء التوكن
    const token = await this.jwt.signAsync({
      id: user._id,
      role: user.role,
      restaurant: user.restaurant ?? null,
    });

    return {
      message: 'Login success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant ?? null,
      },
    };
  }
}
