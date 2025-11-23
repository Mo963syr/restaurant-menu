export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  image?: string;
  status?: string;
  category: string;
  restaurant: string;
}
