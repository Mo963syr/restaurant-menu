import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Product, ProductSchema } from '../products/product.schema';
import { TablesModule } from '../tables/tables.module';
    import { RestaurantsModule } from 'src/restaurants/restaurant.model';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
     TablesModule,
RestaurantsModule,  
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
