import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Restaurant } from 'src/restaurants/restaurant.schema';

@Schema({ timestamps: true })
export class Table extends Document {
  @Prop({ required: true })
  number: number; // رقم الطاولة

  @Prop({ required: true })
  seats: number; // عدد الكراسي

  @Prop({ type: String, ref: 'Restaurant', required: true })
  restaurant: string;
}

export const TableSchema = SchemaFactory.createForClass(Table);
