import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateAccreditationDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
