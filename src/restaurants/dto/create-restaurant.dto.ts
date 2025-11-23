export class CreateRestaurantDto {
  name: string;
  address?: string;
  logo?: string;

  ownerEmail: string;
  ownerPassword: string;
}

export class UpdateRestaurantDto {
  name?: string;
  logo?: string;
  background?: string;
}