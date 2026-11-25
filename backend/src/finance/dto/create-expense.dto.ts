import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateExpenseDto {
  @IsString() description: string;
  @IsNumber() @Min(1) amount: number;
  @IsString() category: string;
  @IsOptional() @IsString() date?: string;
}
