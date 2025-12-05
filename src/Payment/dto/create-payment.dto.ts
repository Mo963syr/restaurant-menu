// src/payments/dto/create-payment.dto.ts
export class CreatePaymentDto {
  orderId: string;
  cashierId: string;
  amount: number;
  method?: 'cash' | 'card' | 'wallet' | 'other';
  note?: string;
}
