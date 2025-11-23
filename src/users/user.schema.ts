import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['OWNER', 'ADMIN', 'CASHIER', 'WAITER', 'CHEF'], required: true })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant' })
  restaurant: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
