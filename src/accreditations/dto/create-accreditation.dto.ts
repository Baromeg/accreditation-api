import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccreditationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
