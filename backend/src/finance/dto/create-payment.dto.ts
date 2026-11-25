import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentCategoryDto {
  ZAKA = 'ZAKA',
  FUNGU_LA_KUMI = 'FUNGU_LA_KUMI',
  SADAKA = 'SADAKA',
  UJENZI = 'UJENZI',
  GENERAL_DONATION = 'GENERAL_DONATION',
  PROJECT = 'PROJECT',
  SPECIAL = 'SPECIAL',
}

export enum PaymentMethodDto {
  CASH = 'CASH',
  MPESA = 'MPESA',
  BANK = 'BANK',
}

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsString()
  anonymousName?: string;

  @IsEnum(PaymentCategoryDto)
  category: PaymentCategoryDto;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentMethodDto)
  method: PaymentMethodDto;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
