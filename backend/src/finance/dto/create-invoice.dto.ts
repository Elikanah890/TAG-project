import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export enum InvoiceStatusDto {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
}

export enum InvoiceCategoryDto {
  ZAKA = 'ZAKA',
  FUNGU_LA_KUMI = 'FUNGU_LA_KUMI',
  SADAKA = 'SADAKA',
  UJENZI = 'UJENZI',
  GENERAL_DONATION = 'GENERAL_DONATION',
  PROJECT = 'PROJECT',
  SPECIAL = 'SPECIAL',
}

export class InvoiceItemDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class InvoiceRecipientDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsString()
  recipientName: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  recipientWhatsapp?: string;

  @IsOptional()
  @IsString()
  recipientAddress?: string;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  recipientWhatsapp?: string;

  @IsOptional()
  @IsString()
  recipientAddress?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceRecipientDto)
  recipients?: InvoiceRecipientDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsEnum(InvoiceCategoryDto)
  category?: InvoiceCategoryDto;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsEnum(InvoiceStatusDto)
  status?: InvoiceStatusDto;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentInstructions?: string;
}
