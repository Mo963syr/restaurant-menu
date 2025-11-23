export class CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
  priority?: number;
  restaurant: string;
}
