import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class RecordSundayAttendanceDto {
  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  firstServiceCount: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  secondServiceCount: number;
}
