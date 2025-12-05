// src/payments/cash-session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class CashSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  cashier: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: string;

  @Prop({ default: 0 })
  openingBalance: number;

  @Prop({ default: 0 })
  expectedClosingBalance: number;

  @Prop({ default: 0 })
  actualClosingBalance: number;

  @Prop({ default: 0 })
  difference: number;

  @Prop()
  closedAt?: Date;
}

export const CashSessionSchema = SchemaFactory.createForClass(CashSession);
