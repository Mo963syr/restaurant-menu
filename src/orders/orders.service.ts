import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order } from './order.schema';
import { Product } from '../products/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';  
import { Table } from '../tables/table.schema';
import { Restaurant } from '../restaurants/restaurant.schema';
import {User} from 'src/users/user.schema';
const VALID_STATUSES = ['active', 'paid', 'cancelled', 'completed'] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private model: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Table.name) private tableModel: Model<Table>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // إنشاء طلب جديد
  async create(dto: CreateOrderDto) {
    const { restaurantId, tableId, waiterId, items, discount, paymentMethod } = dto;

    // التحقق من أن معرّف المطعم صالح ويوجود
    if (!restaurantId || !isValidObjectId(restaurantId)) {
      throw new BadRequestException('معرف المطعم غير صالح');
    }
    const findRestaurant = await this.restaurantModel.findById(restaurantId);
    if (!findRestaurant) {
      throw new NotFoundException('المطعم غير موجود.');
    }

    // التحقق من أن معرّف الطاولة صالح ويوجود
    if (!tableId || !isValidObjectId(tableId)) {
      throw new BadRequestException('معرف الطاولة غير صالح');
    }
    const table = await this.tableModel.findById(tableId);
    if (!table) {
      throw new NotFoundException('الطاولة غير موجودة.');
    }

    // التحقق من أن معرّف النادل صالح
    if (!waiterId || !isValidObjectId(waiterId)) {
      throw new BadRequestException('معرف النادل غير صالح');
    }
    const findWaiter = await this.userModel.findById(waiterId);
    if (!findWaiter) {
      throw new NotFoundException('النادل غير موجود.');
    }

    // التحقق من أن الطلب يحتوي على عناصر
    if (!items || items.length === 0) {
      throw new BadRequestException('الطلب يجب أن يحتوي على عناصر.');
    }

    // التحقق من حالة الطاولة (لا يمكن أن تكون مشغولة أو غير متاحة)
    if (table.status !== 'active') {
      throw new BadRequestException('الطاولة غير متاحة. يرجى اختيار طاولة أخرى.');
    }

    // استخراج معرّفات المنتجات
    const productIds = items.map((i) => i.productId);

    // جلب المنتجات من قاعدة البيانات للتحقق من وجودها
    const products = await this.productModel.find({
      _id: { $in: productIds },
      status: 'active', // اختياري: لا تقبل منتجات غير مفعّلة
    });



    // إنشاء خريطة للمنتجات التي تم جلبها بناءً على المعرّف
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let total = 0;

    // بناء عناصر الطلب مع الملاحظات + السعر من المنتج
    const orderItems = items.map((item) => {
      if (!item.quantity || item.quantity <= 0) {
        throw new BadRequestException('الكمية لكل منتج يجب أن تكون أكبر من 0.');
      }

      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(
          `المنتج بالمعرّف ${item.productId} غير موجود.`,
        );
      }

      const unitPrice = product.price ?? 0;

      total += unitPrice * item.quantity;

      return {
        product: product._id,
        quantity: item.quantity,
        note: item.note, // ملاحظة لكل منتج
        unitPrice,
      };
    });

    // تطبيق الخصم (إن وجد)
    let finalTotal = total;
    if (discount && discount > 0) {
      finalTotal = Math.max(0, total - discount);
    }

    // إنشاء الطلب وحفظه
    const order = new this.model({
      restaurantId,
      tableId,
      waiterId,
      items: orderItems,
      total: finalTotal,
      discount: discount ?? 0,
      paymentMethod: paymentMethod ?? 'cash',
      status: 'active',
    });

    return order.save();
  }

  // جلب جميع الطلبات لمطعم معيّن (مع populate للمنتجات)
  async findAllByRestaurant(restaurantId: string, status?: string) {
    if (!isValidObjectId(restaurantId)) {
      throw new BadRequestException('معرف المطعم غير صالح');
    }

    const filter: any = { restaurantId };
    if (status) {
      if (!VALID_STATUSES.includes(status as OrderStatus)) {
        throw new BadRequestException(
          'الحالة يجب أن تكون active أو paid أو cancelled',
        );
      }
      filter.status = status;
    }

    const orders = await this.model
      .find(filter)
      .populate('items.product') // جلب بيانات كل منتج
      .sort({ createdAt: -1 })
      .exec();

    if (!orders.length) {
      throw new NotFoundException('لا توجد طلبات لهذا المطعم.');
    }

    return orders;
  }

  // جلب طلب معين بالمعرّف
  async findOne(orderId: string) {
    if (!isValidObjectId(orderId)) {
      throw new BadRequestException('معرف الطلب غير صالح');
    }

    const order = await this.model
      .findById(orderId)
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('الطلب غير موجود.');
    }

    return order;
  }

  // تحديث حالة الطلب
  async updateStatus(orderId: string, status: string) {
    if (!isValidObjectId(orderId)) {
      throw new BadRequestException('معرف الطلب غير صالح');
    }

    if (!VALID_STATUSES.includes(status as OrderStatus)) {
      throw new BadRequestException(
        'الحالة يجب أن تكون active أو paid أو cancelled',
      );
    }

    const update: any = { status };

    // عند انتهاء الطلب نحدّد وقت الانتهاء
    if (status === 'paid' || status === 'cancelled') {
      update.finishedAt = new Date();
    }

    const order = await this.model.findByIdAndUpdate(orderId, update, {
      new: true,
    });

    if (!order) {
      throw new NotFoundException('الطلب غير موجود.');
    }

    return order;
  }
}
