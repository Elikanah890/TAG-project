import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const emptyToUndefined = ({ value }: { value: any }) => (value === '' ? undefined : value);

export class RegisterMemberDto {
  @IsString()
  fullName: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  gender?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsDateString()
  dateOfBirth?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  phone?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  whatsappNumber?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsEmail()
  email?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  maritalStatus?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  originRegion?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  originDistrict?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  currentRegion?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  currentDistrict?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  currentWard?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  currentStreet?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  employmentStatus?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  occupation?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  emergencyContactName?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  emergencyContactPhone?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  baptismStatus?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  preferredDepartment?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  desiredDepartment?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  currentPosition?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  ushemasi?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  timeInChurch?: string;

  @IsOptional() @Transform(emptyToUndefined) @IsString()
  expectedStayDuration?: string;
}
