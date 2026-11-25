import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreatePledgeDto {
  @IsString() memberId: string;
  @IsNumber() @Min(1) amount: number;
  @IsOptional() @IsString() targetDate?: string;
  @IsOptional() @IsString() notes?: string;
}
