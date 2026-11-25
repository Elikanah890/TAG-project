import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum InvoicePaymentMethodDto {
  CASH = 'CASH',
  MPESA = 'MPESA',
  BANK = 'BANK',
}

export enum InvoicePaymentCategoryDto {
  ZAKA = 'ZAKA',
  FUNGU_LA_KUMI = 'FUNGU_LA_KUMI',
  SADAKA = 'SADAKA',
  UJENZI = 'UJENZI',
  GENERAL_DONATION = 'GENERAL_DONATION',
  PROJECT = 'PROJECT',
  SPECIAL = 'SPECIAL',
}

export class CreateInvoicePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(InvoicePaymentMethodDto)
  method: InvoicePaymentMethodDto;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsEnum(InvoicePaymentCategoryDto)
  category?: InvoicePaymentCategoryDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
