import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ default: 1 })
  quantity: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Table', required: true })
  tableId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  waiterId: Types.ObjectId;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({
    enum: ['cash', 'card', 'online'],
    default: 'cash',
  })
  paymentMethod: string;

  @Prop({
    enum: ['active', 'paid', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop()
  finishedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
