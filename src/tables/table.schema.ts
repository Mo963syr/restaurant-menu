import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Restaurant } from 'src/restaurants/restaurant.schema';

@Schema({ timestamps: true })
export class Table extends Document {
  @Prop({ required: true })
  number: number; // رقم الطاولة

  @Prop({ })
  seats: number; // عدد الكراسي

   @Prop({ default: 'active' })
  status: string;

  @Prop({ type: String, ref: 'Restaurant' })
  restaurant: string;
}

export const TableSchema = SchemaFactory.createForClass(Table);
