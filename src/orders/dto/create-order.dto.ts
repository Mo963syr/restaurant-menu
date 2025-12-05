export class CreateOrderItemDto {
  productId: string;
  quantity: number;
  note?: string; // ملاحظة لكل منتج في الطلب
}

export class CreateOrderDto {
  restaurantId: string;
  tableId: string;
  waiterId: string;
  items: CreateOrderItemDto[];
  discount?: number;
  paymentMethod?: string;
}
