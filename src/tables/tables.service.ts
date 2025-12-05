import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Table } from './table.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { CreateTablesBulkDto } from './dto/create-tables-bulk.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class TablesService {
  constructor(@InjectModel(Table.name) private model: Model<Table>) {}

  // ------------------------
  // 1️⃣ إنشاء عدة طاولات دفعة واحدة
  // ------------------------
async createMultiple(dto: CreateTablesBulkDto) {
  const { restaurantId, count, defaultStatus } = dto;

  // التحقق من العدد
  if (count <= 0) {
    throw new BadRequestException('عدد الطاولات يجب أن يكون أكبر من 0');
  }

  // التحقق من صحة restaurantId
  if (!isValidObjectId(restaurantId)) {
    throw new BadRequestException('معرف المطعم غير صالح');
  }


  // العثور على آخر طاولة في هذا المطعم
  const lastTable = await this.model.findOne({ restaurant: restaurantId }).sort({ number: -1 }).exec();

  // تحديد الرقم التالي للطاولة
  const startNumber = lastTable ? lastTable.number + 1 : 1;

  const tables: Partial<Table>[] = [];

  // إنشاء الطاولات الجديدة
  for (let i = 0; i < count; i++) {
    tables.push({
      restaurant: restaurantId,
      number: startNumber + i,  // تحديد الرقم التالي للطاولة
      status: defaultStatus,
    });
  }

  // إدخال الطاولات في قاعدة البيانات
  return this.model.insertMany(tables);
}

  // ------------------------
  // 2️⃣ إنشاء طاولة جديدة
  // ------------------------
  create(dto: CreateTableDto) {
    if (!dto.restaurantId) {
      throw new BadRequestException('معرف المطعم مطلوب');
    }
    if (!dto.tableNumber) {
      throw new BadRequestException('رقم الطاولة مطلوب');
    }
    return this.model.create(dto);
  }

  // ------------------------
  // 3️⃣ جلب كل الطاولات بناءً على المطعم
  // ------------------------
  async findAllByRestaurant(restaurant: string) {
    if (!isValidObjectId(restaurant)) {
      throw new BadRequestException('معرف المطعم غير صالح');
    }

    const tables = await this.model.find({ restaurant });
    if (!tables || tables.length === 0) {
      throw new NotFoundException('لا توجد طاولات لهذا المطعم');
    }

    return tables;
  }

  // ------------------------
  // 4️⃣ تحديث حالة الطاولة
  // ------------------------
  async updateStatus(id: string, status: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('معرف الطاولة غير صالح');
    }

    if (!['active', 'busy', 'reserved'].includes(status)) {
      throw new BadRequestException('الحالة يجب أن تكون active أو busy أو reserved');
    }

    const table = await this.model.findByIdAndUpdate(id, { status }, { new: true });
    if (!table) {
      throw new NotFoundException('الطاولة غير موجودة');
    }

    return table;
  }

  // ------------------------
  // 5️⃣ حذف طاولة
  // ------------------------
  async delete(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('معرف الطاولة غير صالح');
    }

    const table = await this.model.findByIdAndDelete(id);
    if (!table) {
      throw new NotFoundException('الطاولة غير موجودة');
    }

    return { message: 'تم حذف الطاولة بنجاح' };
  }
}
