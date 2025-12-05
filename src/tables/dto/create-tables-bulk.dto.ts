import { IsNumber, IsString, IsEnum } from 'class-validator';

export class CreateTablesBulkDto {
  @IsString()
  restaurantId: string;

  @IsNumber()
  count: number;  // عدد الطاولات

  @IsEnum(['active', 'busy', 'reserved'], {
    message: 'الحالة يجب أن تكون active أو busy أو reserved',
  })
  defaultStatus: 'active' | 'busy' | 'reserved';
}
