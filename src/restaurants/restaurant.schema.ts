import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Restaurant extends Document {

  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  logo: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
