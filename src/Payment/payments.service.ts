// src/payments/payments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId , Types} from 'mongoose';
import { Payment } from './payment.schema';
import { CashSession } from './cash-session.schema';
import { Order } from '../orders/order.schema';
import { User } from '../users/user.schema';
import { Restaurant } from '../restaurants/restaurant.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(CashSession.name) private sessionModel: Model<CashSession>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  // 1️⃣ فتح جلسة كاشير (صندوق جديد)
  async openSession(dto: OpenSessionDto) {
    const { cashierId, restaurantId, openingBalance = 0 } = dto;

    if (!isValidObjectId(cashierId)) {
      throw new BadRequestException('معرّف الكاشير غير صالح');
    }
    if (!isValidObjectId(restaurantId)) {
      throw new BadRequestException('معرّف المطعم غير صالح');
    }

    const cashier = await this.userModel.findById(cashierId);
    if (!cashier) throw new NotFoundException('الكاشير غير موجود');

    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('المطعم غير موجود');

    // لا تفتح جلسة جديدة لو في جلسة مفتوحة لنفس الكاشير والمطعم
    const openSession = await this.sessionModel.findOne({
      cashier: cashierId,
      restaurant: restaurantId,
      status: 'open',
    });

    if (openSession) {
      throw new BadRequestException(
        'يوجد جلسة كاشير مفتوحة بالفعل لهذا الكاشير في هذا المطعم.',
      );
    }

    const session = new this.sessionModel({
      cashier: cashierId,
      restaurant: restaurantId,
      openingBalance,
      status: 'open',
    });

    return session.save();
  }

  // 2️⃣ تسجيل دفعة لطلب معيّن
  async createPayment(dto: CreatePaymentDto) {
    const { orderId, cashierId, amount, method = 'cash', note } = dto;

    if (!isValidObjectId(orderId)) {
      throw new BadRequestException('معرّف الطلب غير صالح');
    }
    if (!isValidObjectId(cashierId)) {
      throw new BadRequestException('معرّف الكاشير غير صالح');
    }
    if (!amount || amount <= 0) {
      throw new BadRequestException('المبلغ يجب أن يكون أكبر من 0');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    const cashier = await this.userModel.findById(cashierId);
    if (!cashier) {
      throw new NotFoundException('الكاشير غير موجود');
    }

    // إيجاد جلسة كاشير مفتوحة لهذا الكاشير وهذا المطعم
    const session = await this.sessionModel.findOne({
      cashier: cashierId,
      restaurant: order.restaurantId,
      status: 'open',
    });

    if (!session) {
      throw new BadRequestException(
        'لا توجد جلسة كاشير مفتوحة. افتح جلسة أولاً قبل تسجيل الدفعات.',
      );
    }

    // مجموع المدفوعات السابقة لهذا الطلب
    const previousPayments = await this.paymentModel.aggregate([
      { $match: { order: order._id, isRefund: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const alreadyPaid = previousPayments[0]?.total ?? 0;
    const orderTotal = order.total ?? 0;

    if (alreadyPaid >= orderTotal) {
      throw new BadRequestException('هذا الطلب مدفوع بالكامل بالفعل.');
    }

    if (alreadyPaid + amount > orderTotal) {
      throw new BadRequestException(
        'قيمة الدفع أكبر من المبلغ المتبقي للطلب.',
      );
    }

    const payment = await this.paymentModel.create({
      order: order._id,
      cashier: cashier._id,
      restaurant: order.restaurantId,
      session: session._id,
      amount,
      method,
      isRefund: false,
      note,
    });

    const newPaid = alreadyPaid + amount;
    const remaining = orderTotal - newPaid;

    // إذا اكتمل الدفع غيّر حالة الطلب إلى "paid"
    if (newPaid === orderTotal) {
      order.status = 'paid';
      order.paymentMethod = method;
      await order.save();
    }

    return {
      payment,
      paidTotal: newPaid,
      remaining,
    };
  }

  // 3️⃣ إغلاق / تصفير الصندوق (إغلاق جلسة الكاشير)
  async closeSession(dto: CloseSessionDto) {
    const { sessionId, actualClosingBalance } = dto;

    if (!isValidObjectId(sessionId)) {
      throw new BadRequestException('معرّف الجلسة غير صالح');
    }

    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('جلسة الكاشير غير موجودة');
    }
    if (session.status === 'closed') {
      throw new BadRequestException('هذه الجلسة مغلقة مسبقاً.');
    }

    // مجموع مدفوعات الكاش خلال هذه الجلسة
    const payments = await this.paymentModel.aggregate([
      { $match: { session: session._id, isRefund: false, method: 'cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paymentsTotal = payments[0]?.total ?? 0;

    const expectedClosing =
      (session.openingBalance ?? 0) + paymentsTotal;

    const difference = actualClosingBalance - expectedClosing;

    session.expectedClosingBalance = expectedClosing;
    session.actualClosingBalance = actualClosingBalance;
    session.difference = difference;
    session.status = 'closed';
    session.closedAt = new Date();

    await session.save();

    return {
      message: 'تم إغلاق الجلسة وتصفير الصندوق.',
      session,
    };
  }

  // 4️⃣ تقارير الكاشير (يومي / أسبوعي / شهري)
async getCashierTransactions(
  cashierId: string,
  restaurantId: string | undefined,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily',
) {
  if (!isValidObjectId(cashierId)) {
    throw new BadRequestException('معرّف الكاشير غير صالح');
  }

  // نحول الـ id إلى ObjectId صراحة
  const cashierObjectId = new Types.ObjectId(cashierId);

  const now = new Date();
  const to = new Date(now);               // نهاية الفترة (اليوم الحالي)
  to.setHours(23, 59, 59, 999);

  const from = new Date(to);              // بداية الفترة

  if (period === 'daily') {
    from.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    from.setMonth(from.getMonth() - 1);
    from.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    from.setFullYear(from.getFullYear() - 1);
    from.setHours(0, 0, 0, 0);
  }

  const filter: any = {
    cashier: cashierObjectId,
    isRefund: { $ne: true },              // لا نحسب المرتجعات
    createdAt: { $gte: from, $lte: to },  // داخل الفترة
  };

  // في جدول Payment عندك restaurant محفوظ كسلسلة string (مو ObjectId)
  // من الصورة: "restaurant": "6921c9957b4603edd920d2e6"
  if (restaurantId) {
    filter.restaurant = restaurantId;     // string عادي
  }

  const payments = await this.paymentModel
    .find(filter)
    .populate('order')
    .sort({ createdAt: -1 })
    .exec();

  const total = payments.reduce((sum, p: any) => sum + p.amount, 0);

  return {
    cashierId,
    restaurantId: restaurantId || null,
    period,
    from,
    to,
    count: payments.length,
    totalAmount: total,
    // payments,
  };
}

async getRestaurantSalesReport(
  restaurantId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily',
) {
  if (!isValidObjectId(restaurantId)) {
    throw new BadRequestException('معرّف المطعم غير صالح');
  }

  const restaurant = await this.restaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundException('المطعم غير موجود.');
  }

  const now = new Date();
  const to = new Date(now); // نهاية الفترة
  to.setHours(23, 59, 59, 999);

  const from = new Date(to); // بداية الفترة

  switch (period) {
    case 'daily':
      // من بداية اليوم الحالي
      from.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      from.setMonth(from.getMonth() - 1);
      from.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      from.setFullYear(from.getFullYear() - 1);
      from.setHours(0, 0, 0, 0);
      break;
    default:
      from.setHours(0, 0, 0, 0);
  }

  // أي دفعة ليست refund وداخل الفترة
  const baseMatch: any = {
    isRefund: { $ne: true },
    createdAt: { $gte: from, $lte: to },
  };

  // في حالة restaurantId مخزّن كـ ObjectId في orders
  const restaurantObjectId = new Types.ObjectId(restaurantId);

  // -------- 1) خط الزمن timeline --------
  let groupId: any;
  if (period === 'yearly') {
    groupId = { year: { $year: '$createdAt' } };
  } else if (period === 'monthly') {
    groupId = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
    };
  } else {
    groupId = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  }

  const timelineRaw = await this.paymentModel.aggregate([
    { $match: baseMatch },
    {
      $lookup: {
        from: 'orders',              // اسم كولكشن الطلبات
        localField: 'order',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    {
      // نفلتر على المطعم
      $match: {
        $or: [
          { 'order.restaurantId': restaurantObjectId },       // لو ObjectId
          { 'order.restaurantId': restaurantId },             // لو string
        ],
      },
    },
    {
      $group: {
        _id: groupId,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
      },
    },
  ]);

  const timeline = timelineRaw.map((item: any) => {
    const { _id, totalAmount, count } = item;
    let label: string;

    if (period === 'yearly') {
      label = `${_id.year}`;
    } else if (period === 'monthly') {
      const m = String(_id.month).padStart(2, '0');
      label = `${_id.year}-${m}`;
    } else {
      const m = String(_id.month).padStart(2, '0');
      const d = String(_id.day).padStart(2, '0');
      label = `${_id.year}-${m}-${d}`;
    }

    return { label, totalAmount, count };
  });

  // -------- 2) حسب وسيلة الدفع methods --------
  const methodsAgg = await this.paymentModel.aggregate([
    { $match: baseMatch },
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    {
      $match: {
        $or: [
          { 'order.restaurantId': restaurantObjectId },
          { 'order.restaurantId': restaurantId },
        ],
      },
    },
    {
      $group: {
        _id: '$method',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const methods = methodsAgg.map((m: any) => ({
    method: m._id,
    totalAmount: m.totalAmount,
    count: m.count,
  }));

  const totalAmount = timeline.reduce((sum, t) => sum + t.totalAmount, 0);
  const count = timeline.reduce((sum, t) => sum + t.count, 0);

  return {
    restaurantId,
    period,
    from,
    to,
    totalAmount,
    count,
    methods,
    timeline,
  };
}


}
