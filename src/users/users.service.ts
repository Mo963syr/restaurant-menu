import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDto) {

    const exists = await this.userModel.findOne({ email: dto.email});
    if (exists) throw new BadRequestException('Email or password error');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({ ...dto, password: hashedPassword });
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, dto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
