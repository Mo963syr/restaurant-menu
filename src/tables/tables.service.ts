import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table } from './table.schema';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(@InjectModel(Table.name) private model: Model<Table>) {}

  create(dto: CreateTableDto) {
    return this.model.create(dto);
  }

  findAllByRestaurant(restaurantId: string) {
    return this.model.find({ restaurantId });
  }

  updateStatus(id: string, status: string) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true });
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
