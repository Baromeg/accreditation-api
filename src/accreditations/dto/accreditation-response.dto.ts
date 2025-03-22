import { Accreditation, AccreditationStatus } from '@prisma/client';

export class AccreditationResponseDto {
  id: string;
  name: string;
  status: AccreditationStatus;
  expirationDate: Date | null;

  constructor(accreditation: Accreditation) {
    this.id = accreditation.id;
    this.name = accreditation.name;
    this.status = accreditation.status;
    this.expirationDate = accreditation.expirationDate;
  }
}
