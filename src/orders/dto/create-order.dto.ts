export class CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  restaurantId: string;
  tableId: string;
  waiterId: string;
  items: CreateOrderItemDto[];
  discount?: number;
  paymentMethod?: string;
}
