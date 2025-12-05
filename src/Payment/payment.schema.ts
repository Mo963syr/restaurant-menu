// src/payments/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Order } from '../orders/order.schema';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: Order.name, required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  cashier: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({
    enum: ['cash', 'card', 'wallet', 'other'],
    default: 'cash',
  })
  method: string;

  @Prop({ default: false })
  isRefund: boolean;

  @Prop()
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'CashSession' })
  session?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
