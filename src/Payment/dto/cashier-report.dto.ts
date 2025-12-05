// src/payments/dto/cashier-report.dto.ts
export class CashierReportQueryDto {
  cashierId: string;
  restaurantId?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}
