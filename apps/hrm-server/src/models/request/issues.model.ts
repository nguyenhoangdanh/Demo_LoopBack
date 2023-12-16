import { NumberIdType } from '@lb/infra';
import { model, property } from '@loopback/repository';
import { Issue } from '../entities';

@model()
export class IssueReq extends Issue {
  @property({ type: 'array', itemType: 'number' })
  assigneeIds?: number[];
  @property({ type: 'array', itemType: 'number' })
  tagIds?: number[];
}
