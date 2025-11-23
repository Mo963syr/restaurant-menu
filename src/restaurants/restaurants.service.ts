import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant } from './restaurant.schema';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}


  async create(dto: CreateRestaurantDto) {
    const { ownerEmail, ownerPassword, name, address, logo } = dto;

   
    const exists = await this.userModel.findOne({ email: ownerEmail });
    if (exists) throw new BadRequestException('Owner email already exists');

   
    const hashedPass = await bcrypt.hash(ownerPassword, 10);

  
    const owner = await this.userModel.create({
      email: ownerEmail,
      password: hashedPass,
      role: 'ADMIN',
    });

    // Create Restaurant
    const restaurant = await this.restaurantModel.create({
      name,
      address,
      logo,
      owner: owner._id,
    });

    // Bind owner → restaurant
    owner.restaurant = restaurant._id;
    await owner.save();

    return {
      message: 'Restaurant & Owner created successfully',
      restaurant,
      owner,
    };
  }

  // ============================================================
  // FIND ALL Restaurants
  // ============================================================
  async findAll() {
    return this.restaurantModel.find().populate('owner');
  }

  // ============================================================
  // FIND ONE BY ID
  // ============================================================
  async findOne(id: string) {
    const restaurant = await this.restaurantModel.findById(id).populate('owner');
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return restaurant;
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(id: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.restaurantModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return restaurant;
  }

  // ============================================================
  // DELETE
  // ============================================================
  async remove(id: string) {
    const restaurant = await this.restaurantModel.findByIdAndDelete(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return { message: 'Restaurant deleted successfully' };
  }
}
