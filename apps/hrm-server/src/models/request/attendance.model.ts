import { model, property } from '@loopback/repository';

@model()
export class NewAttendance {
  @property({ type: 'number', require: true })
  userId: number;

  @property({ type: 'string', require: true })
  address: string;

  @property({ type: 'object', require: true })
  coordinates: object;

  constructor(data: Partial<NewAttendance>) {
    Object.assign(this, data);
  }
}
